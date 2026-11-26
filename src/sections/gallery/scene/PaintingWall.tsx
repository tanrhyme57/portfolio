import { LAYOUT } from '../layout';
import { Block } from './Block';
import type { GalleryMaterials } from './materials';

interface PaintingWallProps {
  /** Screen width over height: the painting takes the screen's shape. */
  aspect: number;
  materials: GalleryMaterials;
}

/**
 * The plaster wall the stats sheet hangs on, in its gold frame. Where the
 * painting is, the wall has a hole: the HTML sheet covers it until the
 * camera flies through.
 */
export function PaintingWall({ aspect, materials }: PaintingWallProps) {
  const { height, centreY, moulding, mouldingDepth, plaque } = LAYOUT.painting;
  const { width: wallWidth, height: wallHeight, thickness } = LAYOUT.wall;
  const width = height * aspect;
  const z = -thickness / 2;

  const top = centreY + height / 2;
  const bottom = centreY - height / 2;
  const sideWidth = (wallWidth - width) / 2;
  const frameZ = mouldingDepth / 2;
  const outerWidth = width + 2 * moulding;

  return (
    <group>
      {/* Wall around the hole. */}
      <Block
        size={[sideWidth, wallHeight, thickness]}
        position={[-(width + sideWidth) / 2, wallHeight / 2, z]}
        material={materials.plaster}
      />
      <Block
        size={[sideWidth, wallHeight, thickness]}
        position={[(width + sideWidth) / 2, wallHeight / 2, z]}
        material={materials.plaster}
      />
      <Block
        size={[width, wallHeight - top, thickness]}
        position={[0, (wallHeight + top) / 2, z]}
        material={materials.plaster}
      />
      <Block
        size={[width, bottom, thickness]}
        position={[0, bottom / 2, z]}
        material={materials.plaster}
      />

      {/* Frame, built to fit whatever shape the screen gives the painting. */}
      <Block
        size={[outerWidth, moulding, mouldingDepth]}
        position={[0, top + moulding / 2, frameZ]}
        material={materials.gold}
      />
      <Block
        size={[outerWidth, moulding, mouldingDepth]}
        position={[0, bottom - moulding / 2, frameZ]}
        material={materials.gold}
      />
      <Block
        size={[moulding, height, mouldingDepth]}
        position={[-(width + moulding) / 2, centreY, frameZ]}
        material={materials.gold}
      />
      <Block
        size={[moulding, height, mouldingDepth]}
        position={[(width + moulding) / 2, centreY, frameZ]}
        material={materials.gold}
      />
      <Block
        size={[plaque.width, plaque.height, 0.01]}
        position={[0, bottom - moulding - plaque.gap, 0.005]}
        material={materials.gold}
      />

      {/* Floor of the room the camera starts in. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 5]} material={materials.room}>
        <planeGeometry args={[wallWidth, 10]} />
      </mesh>
    </group>
  );
}
