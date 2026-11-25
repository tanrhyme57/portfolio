import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { useIsCoarsePointer, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { desktopSwarm, touchSwarm } from './config';
import { Swarm } from './Swarm';
import styles from './SwarmCanvas.module.css';

interface SwarmCanvasProps {
  /** Rendering pauses while false (scrolled away or faded out). */
  active: boolean;
}

/** Full-bleed, see-through 3D layer for the swarm. Loaded lazily so the text paints first. */
export default function SwarmCanvas({ active }: SwarmCanvasProps) {
  const reducedMotion = usePrefersReducedMotion();
  const config = useIsCoarsePointer() ? touchSwarm : desktopSwarm;

  return (
    <div className={styles.layer} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 30, position: [0, 0, 12], near: 0.1, far: 50 }}
        frameloop={active ? 'always' : 'never'}
      >
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#f3ede0', '#2a2a2a', 0.9]} />
        <directionalLight position={[-4, 6, 5]} intensity={2.4} color="#fff3e2" />
        <directionalLight position={[5, 1, -4]} intensity={1.4} color="#c9d4ff" />
        <Suspense fallback={null}>
          <Swarm key={config.count} config={config} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
