import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type Ref, type RefObject } from 'react';
import {
  MeshBasicMaterial,
  SRGBColorSpace,
  TextureLoader,
  type Group,
  type Mesh,
  type PointLight,
} from 'three';
import figureUrl from '@/assets/textures/hero/figure.webp';
import figurePointUrl from '@/assets/textures/hero/figure-point.webp';
import { readCssColor } from '@/lib/cssColor';
import type { PointerSnapshot } from './usePointerTracker';

/**
 * Both figure images share one frame (width over height), with the head's
 * lowest point (the cursor's hot spot) at this spot in it.
 */
const FIGURE_FRAME = { aspect: 164 / 157, head: { x: 0.4673, y: 0.949 } } as const;

interface FigureProps {
  /** The parent moves this group to the hot spot and scales it to the figure's height. */
  ref: Ref<Group>;
  pointer: RefObject<PointerSnapshot>;
}

/**
 * The little paper figure that stands in for the cursor, hanging head down
 * from the bots that hold his feet. Over something clickable, or while the
 * mouse is pressed, he switches to his pointing pose. A faint warm light
 * from him catches the bots around his feet.
 */
export function Figure({ ref, pointer }: FigureProps) {
  const textures = useLoader(TextureLoader, [figureUrl, figurePointUrl]);
  const pose = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);
  const tinted = useRef(false);

  const [normal, pointing] = useMemo(
    () =>
      textures.map((texture) => {
        const copy = texture.clone();
        copy.colorSpace = SRGBColorSpace;
        return new MeshBasicMaterial({
          map: copy,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        });
      }) as [MeshBasicMaterial, MeshBasicMaterial],
    [textures],
  );
  useEffect(
    () => () => {
      for (const material of [normal, pointing]) {
        material.map?.dispose();
        material.dispose();
      }
    },
    [normal, pointing],
  );

  useFrame(({ gl }) => {
    if (pose.current) pose.current.material = pointer.current.pointing ? pointing : normal;
    if (!tinted.current && light.current) {
      light.current.color.copy(readCssColor(gl.domElement, '--swarm-glow', '#fff1d6'));
      tinted.current = true;
    }
  });

  // Modelled 1 unit tall with the hot spot at the origin.
  const { aspect, head } = FIGURE_FRAME;
  return (
    <group ref={ref}>
      <mesh
        ref={pose}
        material={normal}
        position={[(0.5 - head.x) * aspect, head.y - 0.5, 0]}
        renderOrder={2}
      >
        <planeGeometry args={[aspect, 1]} />
      </mesh>
      <pointLight ref={light} position={[0, 0.85, 0.4]} intensity={3} distance={20} decay={2} />
    </group>
  );
}
