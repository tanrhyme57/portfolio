import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import { Box3, Group, Vector3, type Material } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import chandelierUrl from '@/assets/models/chandelier.glb?url';
import { LAYOUT, ROOM_BACK_Z, ROOM_CEILING_Y, ROOM_FLOOR_Y } from '../layout';

const ROD_RADIUS = 0.012;

/**
 * The chandelier over the middle of the gallery, on a rod from the ceiling.
 * The model is a slimmed conversion of the FBX (see README, "Assets").
 */
export function Chandelier({ rod }: { rod: Material }) {
  const { object, height } = useChandelierModel();
  const { frontZ } = LAYOUT.room;
  const z = (frontZ + ROOM_BACK_Z) / 2;
  const bottom = ROOM_FLOOR_Y + LAYOUT.chandelier.bottom;
  const top = bottom + height;
  const rodLength = Math.max(0, ROOM_CEILING_Y - top);

  return (
    <group position={[0, 0, z]}>
      <primitive object={object} position-y={top} />
      {rodLength > 0 && (
        <mesh position-y={top + rodLength / 2} material={rod}>
          <cylinderGeometry args={[ROD_RADIUS, ROD_RADIUS, rodLength, 8]} />
        </mesh>
      )}
      <pointLight
        position-y={bottom + height * 0.35}
        intensity={6}
        distance={9}
        decay={1.6}
        color="#ffd9a0"
      />
    </group>
  );
}

/** The model, normalised: centred on x and z, its top at y = 0, scaled to the layout width. */
function useChandelierModel() {
  const gltf = useLoader(GLTFLoader, chandelierUrl);
  return useMemo(() => {
    const model = gltf.scene.clone(true);
    const object = new Group();
    object.add(model);
    const box = new Box3().setFromObject(object);
    const centre = box.getCenter(new Vector3());
    model.position.set(-centre.x, -box.max.y, -centre.z);
    const size = box.getSize(new Vector3());
    const scale = LAYOUT.chandelier.width / Math.max(size.x, size.z);
    object.scale.setScalar(scale);
    return { object, height: size.y * scale };
  }, [gltf]);
}
