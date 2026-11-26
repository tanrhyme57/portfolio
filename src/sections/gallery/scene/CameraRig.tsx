import { useFrame } from '@react-three/fiber';
import { useMemo, type RefObject } from 'react';
import { Vector3 } from 'three';
import { buildCameraPath, sampleCamera } from '../cameraPath';

/** Puts the camera where gallery progress says it should be, every frame drawn. */
interface CameraRigProps {
  progress: RefObject<number>;
  portrait: boolean;
}

export function CameraRig({ progress, portrait }: CameraRigProps) {
  const keys = useMemo(() => buildCameraPath(portrait), [portrait]);
  const pose = useMemo(() => ({ position: new Vector3(), target: new Vector3() }), []);

  useFrame(({ camera }) => {
    sampleCamera(keys, progress.current, pose);
    camera.position.copy(pose.position);
    camera.lookAt(pose.target);
  });
  return null;
}
