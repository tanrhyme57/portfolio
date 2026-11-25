import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { MathUtils, Object3D, type Group, type InstancedMesh } from 'three';
import { readSwarmColors, type SwarmColors } from './colors';
import type { SwarmConfig } from './config';
import { computeFormation, createSlots } from './formation';
import { createGlitchState, glitchShift, updateGlitch } from './glitch';
import { idleTarget } from './idlePath';
import { Orb } from './Orb';
import { createSwarmState, stepSwarm, twitchSwarm, type SwarmState } from './simulation';
import { useBotGeometry } from './useBotGeometry';
import { secondsSince, usePointerTracker } from './usePointerTracker';

interface SwarmProps {
  config: SwarmConfig;
  reducedMotion: boolean;
}

/** Longest frame step we simulate, so a background tab does not explode the springs. */
const MAX_DT = 1 / 30;

/**
 * The bot swarm and the orb they hold up. All the maths lives in plain
 * modules (formation, simulation, glitch); this component only wires them to
 * the pointer and to one instanced mesh, so hundreds of bots cost a single
 * draw call.
 */
export function Swarm({ config, reducedMotion }: SwarmProps) {
  const geometry = useBotGeometry();
  const meshRef = useRef<InstancedMesh>(null);
  const pointer = usePointerTracker();

  const slots = useMemo(() => createSlots(config.count), [config.count]);
  const instanceColors = useMemo(() => new Float32Array(config.count * 3), [config.count]);
  const swarm = useRef<SwarmState | null>(null);
  const glitch = useRef(createGlitchState(config.entry.delay + config.entry.stagger));
  const top = useRef<{ x: number; y: number } | null>(null);
  const orbPosition = useRef<{ x: number; y: number } | null>(null);
  const orbRef = useRef<Group>(null);
  const palette = useRef<SwarmColors | null>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useFrame(({ viewport, clock, gl }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Colour tokens are inherited CSS variables, so the canvas element can read them.
    const colors = (palette.current ??= readSwarmColors(gl.domElement));
    const dt = Math.min(delta, MAX_DT);
    const time = clock.elapsedTime;
    const { width, height } = viewport;
    const botSize = config.botSize * height;
    // The structure hangs from just above the top edge, where the bots drop in from.
    const ceilingY = height / 2 + botSize * 0.3;

    // 1. The orb follows the pointer; the column hangs down and grips it from above.
    const rect = gl.domElement.getBoundingClientRect();
    const worldPerPx = height / rect.height;
    const orbRadius = config.orb.radiusPx * worldPerPx;
    const grip = orbRadius * 0.6; // how far above the orb's centre the tip ring sits
    const p = pointer.current;
    const insideCanvas =
      p.clientX >= rect.left &&
      p.clientX <= rect.right &&
      p.clientY >= rect.top &&
      p.clientY <= rect.bottom;
    const following = p.engaged && insideCanvas;
    const wandering = !following && secondsSince(p.releasedAt) > config.idleDelay[p.kind];

    const wander = idleTarget(reducedMotion ? 0 : time);
    const tip = (top.current ??= { x: (wander.x * width) / 2, y: (wander.y * height) / 2 });
    const orb = (orbPosition.current ??= { x: tip.x, y: tip.y - grip });
    const highestTipY = ceilingY - botSize * 2;

    let goalX = tip.x;
    let goalY = tip.y;
    let rate = config.follow.idle;
    if (following) {
      // The orb sticks to the pointer; the column chases it.
      const [offsetX, offsetY] = config.pointerOffset[p.kind];
      orb.x = (p.clientX - rect.left + offsetX) * worldPerPx - width / 2;
      orb.y = Math.min(
        height / 2 - (p.clientY - rect.top + offsetY) * worldPerPx,
        highestTipY - grip,
      );
      goalX = orb.x;
      goalY = orb.y + grip;
      rate = config.follow.pointer;
    } else if (wandering) {
      goalX = (wander.x * width) / 2;
      goalY = (wander.y * height) / 2;
    }
    goalY = Math.min(goalY, highestTipY);
    const blend = 1 - Math.exp(-rate * dt);
    tip.x += (goalX - tip.x) * blend;
    tip.y += (goalY - tip.y) * blend;
    if (!following) {
      // Nobody is holding it: the orb settles back into the column's grip.
      const settle = 1 - Math.exp(-config.orb.settle * dt);
      orb.x += (tip.x - orb.x) * settle;
      orb.y += (tip.y - grip - orb.y) * settle;
    }
    orbRef.current?.position.set(orb.x, orb.y, 0);
    orbRef.current?.scale.setScalar(orbRadius);

    // 2. Targets for every bot, then move them.
    const motionTime = reducedMotion ? 0 : time;
    computeFormation(
      slots,
      { tipX: tip.x, tipY: tip.y, anchorY: ceilingY, botSize, time: motionTime },
      config,
    );
    const state = (swarm.current ??= createSwarmState(
      config,
      { width, height },
      { instant: reducedMotion },
    ));
    if (!reducedMotion) twitchSwarm(state, config.motion, dt, time, height);
    stepSwarm(state, slots, config, dt, time, height);
    if (!reducedMotion) updateGlitch(glitch.current, time, config.glitch, height, botSize);

    // 3. Write matrices and colours.
    const { display, velocity, startsAt } = state;
    for (let i = 0; i < state.count; i++) {
      const ix = i * 3;
      const y = display[ix + 1]!;
      const shift = reducedMotion ? 0 : glitchShift(glitch.current, y, time);
      const age = time - startsAt[i]!;
      const entering = age < config.entry.stutterDuration;

      dummy.position.set(display[ix]! + shift, y, display[ix + 2]!);
      const vx = velocity[ix]! / height;
      const vy = velocity[ix + 1]! / height;
      const wobble = reducedMotion ? 0 : 0.12 * Math.sin(time * 1.7 + i * 1.31);
      const tumble =
        entering && !reducedMotion ? (1 - age / config.entry.stutterDuration) * 2.4 : 0;
      dummy.rotation.set(
        MathUtils.clamp(vy * 0.5, -0.7, 0.7) + tumble * Math.sin(i),
        slots.yaw[i]! + wobble,
        MathUtils.clamp(-vx * 0.6, -0.7, 0.7) + tumble * Math.cos(i),
        'YXZ',
      );
      dummy.scale.setScalar(botSize);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      let color = colors.bot;
      if (!reducedMotion) {
        if (shift !== 0) color = colors.glitch;
        else if (Math.random() < config.glitch.flickerChance * (entering ? 40 : 1)) {
          color = Math.random() < 0.5 ? colors.glitch : colors.flicker;
        }
      }
      color.toArray(instanceColors, ix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <Orb ref={orbRef} />
      <instancedMesh ref={meshRef} args={[geometry, undefined, config.count]} frustumCulled={false}>
        <instancedBufferAttribute attach="instanceColor" args={[instanceColors, 3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.35} flatShading />
      </instancedMesh>
    </>
  );
}
