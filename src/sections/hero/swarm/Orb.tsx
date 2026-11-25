import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type Ref } from 'react';
import {
  AdditiveBlending,
  CanvasTexture,
  SRGBColorSpace,
  type Group,
  type MeshBasicMaterial,
  type PointLight,
  type SpriteMaterial,
} from 'three';
import { readCssColor } from './colors';

interface OrbProps {
  /** The parent moves and scales this group every frame (scale = radius). */
  ref: Ref<Group>;
}

/**
 * The glowing orb that stands in for the cursor. Modelled at radius 1:
 * a bright core, a soft halo, and a light that catches the bots holding it.
 * Its colour comes from the `--swarm-orb` token.
 */
export function Orb({ ref }: OrbProps) {
  const halo = useMemo(() => createHaloTexture(), []);
  const core = useRef<MeshBasicMaterial>(null);
  const glow = useRef<SpriteMaterial>(null);
  const light = useRef<PointLight>(null);
  const tinted = useRef(false);

  useFrame(({ gl }) => {
    if (tinted.current || !core.current || !glow.current || !light.current) return;
    const color = readCssColor(gl.domElement, '--swarm-orb', '#fff1d6');
    core.current.color.copy(color);
    glow.current.color.copy(color);
    light.current.color.copy(color);
    tinted.current = true;
  });

  return (
    <group ref={ref}>
      <mesh renderOrder={2}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial ref={core} toneMapped={false} />
      </mesh>
      <sprite scale={7} renderOrder={3}>
        <spriteMaterial
          ref={glow}
          map={halo}
          blending={AdditiveBlending}
          depthWrite={false}
          transparent
          toneMapped={false}
        />
      </sprite>
      <pointLight ref={light} intensity={6} distance={30} decay={2} />
    </group>
  );
}

/** White radial gradient drawn once to a small canvas; tinted by the material colour. */
function createHaloTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!;
  const middle = size / 2;
  const gradient = context.createRadialGradient(middle, middle, 0, middle, middle, middle);
  gradient.addColorStop(0, 'rgb(255 255 255 / 1)');
  gradient.addColorStop(0.18, 'rgb(255 255 255 / 0.65)');
  gradient.addColorStop(0.45, 'rgb(255 255 255 / 0.12)');
  gradient.addColorStop(1, 'rgb(255 255 255 / 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
