import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import { Box3, Group, Quaternion, Vector3, type Material } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import frameUrl from '@/assets/models/picture-frame.glb?url';
import { LAYOUT } from '../layout';

/**
 * "Picture Frame" by Olivia Bultinck, CC BY 4.0:
 * https://sketchfab.com/3d-models/picture-frame-1806fe6b8d96461887f21ec3cb9c4878
 * (textures resized and re-encoded for the web; credited on the page too).
 */

/** The model's picture opening, as shares of the frame's outer width and height. */
const OPENING = { width: 0.86, height: 0.8 };

interface PictureFrameProps {
  /** Where the picture's centre is, on the wall. */
  position: Vector3;
  /** Rotation about y that turns the frame (facing +z) to face into the room. */
  yaw: number;
  /** What fills the opening (the project image; a plain placeholder for now). */
  picture: Material;
}

/** One gold project frame, hung flat on the wall with the picture inside it. */
export function PictureFrame({ position, yaw, picture }: PictureFrameProps) {
  const template = useFrameTemplate();
  const frame = useMemo(() => template.object.clone(true), [template]);
  const { width, height, depth } = template.size;

  return (
    <group position={position} rotation-y={yaw}>
      {/* Back of the frame against the wall. */}
      <primitive object={frame} position-z={depth / 2} />
      <mesh position-z={depth * 0.75} material={picture}>
        <planeGeometry args={[width * OPENING.width, height * OPENING.height]} />
      </mesh>
    </group>
  );
}

/**
 * The model, loaded once and normalised: centred, facing +z, turned
 * landscape, and scaled to the layout's frame width.
 */
function useFrameTemplate() {
  const gltf = useLoader(GLTFLoader, frameUrl);
  return useMemo(() => {
    const model = gltf.scene.clone(true);
    // As exported it hangs portrait and faces -x: turn it to face +z, then lay it landscape.
    const faceForward = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
    const landscape = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
    model.quaternion.copy(landscape.multiply(faceForward));

    const object = new Group();
    object.add(model);
    const box = new Box3().setFromObject(object);
    model.position.sub(box.getCenter(new Vector3()));
    const size = box.getSize(new Vector3());
    const scale = LAYOUT.slots.frame.width / size.x;
    object.scale.setScalar(scale);
    return {
      object,
      size: { width: size.x * scale, height: size.y * scale, depth: size.z * scale },
    };
  }, [gltf]);
}
