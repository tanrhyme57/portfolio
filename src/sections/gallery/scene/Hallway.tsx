import { LAYOUT } from '../layout';
import { Block } from './Block';
import type { GalleryMaterials } from './materials';

/**
 * The black hallway the camera walks down, past the word "experience". Its
 * walls are only just lighter than the dark, enough to feel the movement.
 */
export function Hallway({ materials }: { materials: GalleryMaterials }) {
  const { startZ, width, height, door } = LAYOUT.hallway;
  const length = startZ + 2;
  const midZ = length / 2;
  const t = 0.1;

  return (
    <group>
      <Block size={[width, t, length]} position={[0, -t / 2, midZ]} material={materials.hall} />
      <Block
        size={[width, t, length]}
        position={[0, height + t / 2, midZ]}
        material={materials.hall}
      />
      <Block
        size={[t, height, length]}
        position={[-(width + t) / 2, height / 2, midZ]}
        material={materials.hall}
      />
      <Block
        size={[t, height, length]}
        position={[(width + t) / 2, height / 2, midZ]}
        material={materials.hall}
      />
      {/* Black end wall around the black door (see Door). */}
      <Block
        size={[(width - door.width) / 2, height, t]}
        position={[-(width + door.width) / 4, height / 2, -t / 2]}
        material={materials.black}
      />
      <Block
        size={[(width - door.width) / 2, height, t]}
        position={[(width + door.width) / 4, height / 2, -t / 2]}
        material={materials.black}
      />
      <Block
        size={[door.width, height - door.height, t]}
        position={[0, (height + door.height) / 2, -t / 2]}
        material={materials.black}
      />
    </group>
  );
}
