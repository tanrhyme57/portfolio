import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import {
  MathUtils,
  MeshBasicMaterial,
  SRGBColorSpace,
  TextureLoader,
  type Group,
  type Mesh,
  type PointLight,
} from 'three';
import plateUrl from '@/assets/textures/gallery/handle-plate.webp';
import leverClosedUrl from '@/assets/textures/gallery/handle-lever-closed.webp';
import leverOpenUrl from '@/assets/textures/gallery/handle-lever-open.webp';
import { doorState } from '../door';
import { LAYOUT } from '../layout';
import type { GalleryMaterials } from './materials';

/** The three handle images share one frame: width over height. */
const HANDLE_ASPECT = 1269 / 1626;

interface DoorProps {
  progress: RefObject<number>;
  materials: GalleryMaterials;
}

/**
 * A completely black door in the black end wall. All that gives it away is
 * its brass handle, which the stats paper was hiding. As the camera walks
 * up, the lever turns down and the door swings away from it.
 */
export function Door({ progress, materials }: DoorProps) {
  const { width, height, thickness, swingDeg, handle } = LAYOUT.hallway.door;
  const textures = useLoader(TextureLoader, [plateUrl, leverClosedUrl, leverOpenUrl]);
  const hinge = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const closedLever = useRef<Mesh>(null);
  const openLever = useRef<Mesh>(null);

  const handleMaterials = useMemo(() => {
    const [plate, closed, open] = textures.map((texture) => {
      const copy = texture.clone();
      copy.colorSpace = SRGBColorSpace;
      return new MeshBasicMaterial({ map: copy, transparent: true, depthWrite: false });
    }) as [MeshBasicMaterial, MeshBasicMaterial, MeshBasicMaterial];
    return { plate, closed, open };
  }, [textures]);

  useEffect(
    () => () => {
      for (const material of Object.values(handleMaterials)) {
        material.map?.dispose();
        material.dispose();
      }
    },
    [handleMaterials],
  );

  useFrame(() => {
    const state = doorState(progress.current);
    setOpacity(closedLever.current, 1 - state.handle);
    setOpacity(openLever.current, state.handle);
    if (hinge.current) hinge.current.rotation.y = -MathUtils.degToRad(swingDeg) * state.open;
    // Light from the stairs only spills out once the door opens.
    if (light.current) light.current.intensity = 3 * state.open;
  });

  const handleWidth = handle.height * HANDLE_ASPECT;
  const handleX = -width + handle.inset + handleWidth / 2;

  return (
    <group>
      {/* Hinged on the right edge, so it swings away from the camera. */}
      <group ref={hinge} position={[width / 2, 0, 0]}>
        <mesh position={[-width / 2, height / 2, -thickness / 2]} material={materials.black}>
          <boxGeometry args={[width, height, thickness]} />
        </mesh>
        {(['plate', 'closed', 'open'] as const).map((part, i) => (
          <mesh
            key={part}
            ref={part === 'closed' ? closedLever : part === 'open' ? openLever : undefined}
            position={[handleX, handle.y, 0.002 * (i + 1)]}
            material={handleMaterials[part]}
            renderOrder={i + 1}
          >
            <planeGeometry args={[handleWidth, handle.height]} />
          </mesh>
        ))}
      </group>
      <pointLight
        ref={light}
        position={[0, height - 0.3, -0.9]}
        intensity={0}
        distance={6}
        color="#ffe6c4"
      />
    </group>
  );
}

function setOpacity(mesh: Mesh | null, opacity: number) {
  const material = mesh?.material;
  if (material instanceof MeshBasicMaterial) material.opacity = opacity;
}
