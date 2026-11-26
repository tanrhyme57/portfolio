import { smootherstep } from '@/lib/ease';
import { phase } from '@/lib/scrollProgress';
import { BEATS } from './beats';

/**
 * The black door at the end of the hallway, as shares of the hallway walk:
 * the handle (all you can see of the door, once the stats paper has fallen
 * off it) turns, then the door swings open before the camera reaches it.
 */
export const DOOR_TIMING = {
  handle: [0.28, 0.4],
  open: [0.42, 0.8],
} as const satisfies Record<string, readonly [number, number]>;

/** 0..1 for the handle turning and the door opening, at gallery `progress`. */
export function doorState(progress: number): { handle: number; open: number } {
  const walk = phase(progress, BEATS.hallway);
  return {
    handle: smootherstep(walk, ...DOOR_TIMING.handle),
    open: smootherstep(walk, ...DOOR_TIMING.open),
  };
}
