import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, type RefObject } from 'react';
import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LAYOUT } from './layout';
import { CameraRig } from './scene/CameraRig';
import { Illusion } from './scene/Illusion';
import { useGalleryMaterials } from './scene/materials';
import { Door } from './scene/Door';
import { Hallway } from './scene/Hallway';
import { Room } from './scene/Room';
import { Stairs } from './scene/Stairs';
import styles from './GalleryCanvas.module.css';

interface GalleryCanvasProps {
  /** Rendering stops entirely while false. */
  active: boolean;
  /** Gallery progress 0..1, read on every frame drawn. */
  progress: RefObject<number>;
  /** Filled with a function that asks for one new frame; call it when progress changes. */
  invalidateRef: RefObject<(() => void) | null>;
}

/**
 * The 3D hallway and gallery behind the opening. It only draws when asked (on
 * scroll), so a still page costs no GPU time.
 */
export default function GalleryCanvas({ active, progress, invalidateRef }: GalleryCanvasProps) {
  return (
    <div className={styles.layer} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: LAYOUT.fov, near: 0.05, far: 60 }}
        frameloop={active ? 'demand' : 'never'}
      >
        <Scene progress={progress} invalidateRef={invalidateRef} />
      </Canvas>
    </div>
  );
}

function Scene({ progress, invalidateRef }: Omit<GalleryCanvasProps, 'active'>) {
  const materials = useGalleryMaterials();
  const size = useThree((state) => state.size);
  const requestFrame = useThree((state) => state.invalidate);
  const aspect = size.width / Math.max(1, size.height);
  const portrait = aspect < 0.9;

  useStudioReflections();

  useEffect(() => {
    invalidateRef.current = () => requestFrame();
    requestFrame();
    return () => {
      invalidateRef.current = null;
    };
  }, [invalidateRef, requestFrame]);

  return (
    <>
      <color attach="background" args={[materials.void]} />
      <ambientLight intensity={0.7} />
      <hemisphereLight args={['#f3ede0', '#1d1b18', 0.8]} />
      <directionalLight position={[-2, 5, 6]} intensity={1.6} color="#fff3e2" />
      <CameraRig progress={progress} portrait={portrait} />
      <Hallway materials={materials} />
      <Suspense fallback={null}>
        <Door progress={progress} materials={materials} />
      </Suspense>
      <Stairs materials={materials} />
      <Illusion portrait={portrait} materials={materials} />
      <Suspense fallback={null}>
        <Room materials={materials} />
      </Suspense>
    </>
  );
}

/** A soft studio light map for reflections, so the gold frames and marble have something to shine with. */
function useStudioReflections() {
  const get = useThree((state) => state.get);
  useEffect(() => {
    const { gl, scene } = get();
    const pmrem = new PMREMGenerator(gl);
    const target = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.5;
    pmrem.dispose();
    return () => {
      scene.environment = null;
      target.dispose();
    };
  }, [get]);
}
