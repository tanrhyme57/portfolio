import type { Material } from 'three';

interface BlockProps {
  size: readonly [number, number, number];
  position: readonly [number, number, number];
  material: Material;
  rotationY?: number;
}

/** One greybox box. */
export function Block({ size, position, material, rotationY = 0 }: BlockProps) {
  return (
    <mesh position={[...position]} rotation-y={rotationY} material={material}>
      <boxGeometry args={[...size]} />
    </mesh>
  );
}
