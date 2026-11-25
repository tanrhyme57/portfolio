import type { SwarmConfig } from './config';
import type { Slots } from './formation';

/** Mutable state of every bot, stored as flat arrays (one entry per bot). */
export interface SwarmState {
  readonly count: number;
  /** Simulated position, xyz per bot. */
  readonly position: Float32Array;
  readonly velocity: Float32Array;
  /** Drawn position, xyz per bot. Lags `position` while a bot stutters in. */
  readonly display: Float32Array;
  /** Time at which each bot starts dropping in. */
  readonly startsAt: Float32Array;
  frame: number;
}

export interface Bounds {
  /** Visible width and height at the bots' depth, world units. */
  width: number;
  height: number;
}

export type Random = () => number;

/**
 * All bots start above the top edge, spread across the width, waiting their
 * turn. Low indices (the ones that will hold the cursor) drop first.
 */
export function createSwarmState(
  config: SwarmConfig,
  bounds: Bounds,
  options: { instant?: boolean; random?: Random } = {},
): SwarmState {
  const { count, entry } = config;
  const random = options.random ?? Math.random;
  const state: SwarmState = {
    count,
    position: new Float32Array(count * 3),
    velocity: new Float32Array(count * 3),
    display: new Float32Array(count * 3),
    startsAt: new Float32Array(count),
    frame: 0,
  };

  for (let i = 0; i < count; i++) {
    state.position[i * 3] = (random() - 0.5) * bounds.width;
    state.position[i * 3 + 1] = bounds.height * (0.6 + random() * 0.5);
    state.position[i * 3 + 2] = (random() - 0.5) * bounds.height * 0.3;
    state.startsAt[i] = options.instant
      ? 0
      : entry.delay + (i / count) * entry.stagger + random() * entry.jitter;
  }
  state.display.set(state.position);
  return state;
}

/** Puts every bot exactly on its slot (used for reduced motion). */
export function snapToSlots(state: SwarmState, slots: Slots): void {
  state.position.set(slots.position);
  state.display.set(slots.position);
  state.velocity.fill(0);
}

/**
 * Advances the swarm by `dt` seconds: every bot is a damped spring pulled
 * towards its slot, with a speed cap so fast pointer moves leave the swarm
 * lagging behind and catching up.
 */
export function stepSwarm(
  state: SwarmState,
  slots: Slots,
  config: SwarmConfig,
  dt: number,
  time: number,
  worldHeight: number,
): void {
  const { spring, entry } = config;
  const maxSpeed = spring.maxSpeed * worldHeight;
  const { position: p, velocity: v, display } = state;
  state.frame++;

  for (let i = 0; i < state.count; i++) {
    const age = time - state.startsAt[i]!;
    if (age < 0) continue;

    const weight = slots.weight[i]!;
    const stiffness = spring.stiffnessTop + (spring.stiffnessBottom - spring.stiffnessTop) * weight;
    const damping = 2 * spring.dampingRatio * Math.sqrt(stiffness);

    const ix = i * 3;
    let speedSq = 0;
    for (let axis = 0; axis < 3; axis++) {
      const k = ix + axis;
      const accel = stiffness * (slots.position[k]! - p[k]!) - damping * v[k]!;
      v[k] = v[k]! + accel * dt;
      speedSq += v[k]! * v[k]!;
    }
    if (speedSq > maxSpeed * maxSpeed) {
      const scale = maxSpeed / Math.sqrt(speedSq);
      v[ix] = v[ix]! * scale;
      v[ix + 1] = v[ix + 1]! * scale;
      v[ix + 2] = v[ix + 2]! * scale;
    }
    p[ix] = p[ix]! + v[ix]! * dt;
    p[ix + 1] = p[ix + 1]! + v[ix + 1]! * dt;
    p[ix + 2] = p[ix + 2]! + v[ix + 2]! * dt;

    // Stop-motion entry: hold the drawn position for a few frames at a time.
    const stuttering = age < entry.stutterDuration;
    if (!stuttering || (state.frame + i) % entry.stutterFrames === 0) {
      display[ix] = p[ix]!;
      display[ix + 1] = p[ix + 1]!;
      display[ix + 2] = p[ix + 2]!;
    }
  }
}

/**
 * Now and then a bot jerks out of place in a random direction and the spring
 * pulls it back, so the structure never looks perfectly still.
 */
export function twitchSwarm(
  state: SwarmState,
  motion: SwarmConfig['motion'],
  dt: number,
  time: number,
  worldHeight: number,
  random: Random = Math.random,
): void {
  const chance = motion.twitchRate * dt;
  const strength = motion.twitchStrength * worldHeight;
  for (let i = 0; i < state.count; i++) {
    if (time < state.startsAt[i]! || random() >= chance) continue;
    const ix = i * 3;
    state.velocity[ix] = state.velocity[ix]! + (random() - 0.5) * 2 * strength;
    state.velocity[ix + 1] = state.velocity[ix + 1]! + (random() - 0.5) * 2 * strength;
    state.velocity[ix + 2] = state.velocity[ix + 2]! + (random() - 0.5) * strength;
  }
}
