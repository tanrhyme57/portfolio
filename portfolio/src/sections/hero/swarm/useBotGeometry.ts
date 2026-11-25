import { useLoader } from '@react-three/fiber';
import { useMemo } from 'react';
import type { BufferGeometry } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import botModelUrl from '@/assets/models/bot.stl?url';

/**
 * The bot model (exported from SolidWorks as STL), centred and scaled so its
 * longest side is 1. Suspends while loading.
 *
 * To swap the model, replace `src/assets/models/bot.stl`. Keep it low-poly:
 * it is drawn hundreds of times.
 */
export function useBotGeometry(): BufferGeometry {
  const raw = useLoader(STLLoader, botModelUrl);

  return useMemo(() => {
    const geometry = raw.clone();
    geometry.center();
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const longest = Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z);
    geometry.scale(1 / longest, 1 / longest, 1 / longest);
    return geometry;
  }, [raw]);
}
