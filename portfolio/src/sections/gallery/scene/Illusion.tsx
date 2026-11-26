import { useEffect, useMemo } from 'react';
import { BufferAttribute, BufferGeometry } from 'three';
import { illusionPieces } from '../illusion';
import { eyePose } from '../layout';
import type { GalleryMaterials } from './materials';

interface IllusionProps {
  portrait: boolean;
  materials: GalleryMaterials;
}

/** The paper letters and strips that only line up from the eye point. */
export function Illusion({ portrait, materials }: IllusionProps) {
  const quaternion = useMemo(() => eyePose().quaternion, []);
  const pieces = useMemo(
    () =>
      illusionPieces(portrait).map((piece) => {
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(piece.triangles, 3));
        return { ...piece, geometry };
      }),
    [portrait],
  );
  useEffect(() => () => pieces.forEach((piece) => piece.geometry.dispose()), [pieces]);

  return (
    <group>
      {pieces.map((piece, i) => (
        <mesh
          key={i}
          geometry={piece.geometry}
          material={materials.paper}
          position={piece.position}
          quaternion={quaternion}
          scale={piece.scale}
        />
      ))}
    </group>
  );
}
