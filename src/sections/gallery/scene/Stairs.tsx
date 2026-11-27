import { LAYOUT, ROOM_FLOOR_Y, STAIRS_TOP_Z } from '../layout';
import { Block } from './Block';
import type { GalleryMaterials } from './materials';

/** The landing at the end of the hallway and the flight down into the room. */
export function Stairs({ materials }: { materials: GalleryMaterials }) {
  const { width, steps, drop, run } = LAYOUT.stairs;
  const { width: landingWidth, depth: landingDepth } = LAYOUT.landing;
  const rise = drop / steps;
  const tread = run / steps;
  // The landing stands on a solid block down to the room's floor.
  const landingThickness = drop;

  return (
    <group>
      <Block
        size={[landingWidth, landingThickness, landingDepth]}
        position={[0, -landingThickness / 2, -landingDepth / 2]}
        material={materials.plaster}
      />
      {Array.from({ length: steps }, (_, i) => {
        const top = -(i + 1) * rise;
        const height = top - ROOM_FLOOR_Y;
        return (
          <Block
            key={i}
            size={[width, height, tread]}
            position={[0, ROOM_FLOOR_Y + height / 2, STAIRS_TOP_Z - (i + 0.5) * tread]}
            material={materials.plaster}
          />
        );
      })}
    </group>
  );
}
