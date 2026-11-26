import { smootherstep } from '@/lib/ease';
import { phase } from '@/lib/scrollProgress';
import { BEATS } from './beats';
import { LAYOUT } from './dimensions';

/**
 * The hand-off from the HTML opening to the 3D gallery. The plaster fades to
 * black, the stats sheet swings off its top-left corner and falls, and the
 * HTML word "experience" is pinned to a plane in the 3D hallway, so the
 * camera walks past it. Kept free of three.js so the page can run it before
 * the gallery loads.
 */

/** Camera distance along the hallway at the start and end of the walk. */
export const HALLWAY_KEYS: readonly { at: number; z: number }[] = [
  { at: BEATS.hallway[0], z: LAYOUT.hallway.startZ },
  { at: BEATS.hallway[1], z: LAYOUT.hallway.endZ },
];

/** Camera z during the hallway part of the walk (it only moves straight down the hallway). */
export function cameraZAt(progress: number): number {
  const [start, end] = HALLWAY_KEYS as [(typeof HALLWAY_KEYS)[0], (typeof HALLWAY_KEYS)[0]];
  return start.z + (end.z - start.z) * smootherstep(progress, start.at, end.at);
}

/** How opaque the plaster backdrop still is. */
export function backdropOpacity(progress: number): number {
  return 1 - smootherstep(progress, ...BEATS.darken);
}

/** Largest swing of the stats sheet about its top-left corner, in degrees. */
const SWING_DEG = 74;

/**
 * The stats sheet letting go: the right side drops so it swings about its
 * top-left corner (overshooting and settling), hangs, then falls with a
 * little extra spin. `drop` is in screen heights.
 */
export function sheetFall(progress: number): { angle: number; drop: number } {
  const swing = phase(progress, BEATS.swing);
  // A damped swing that settles on SWING_DEG.
  const settle = 1 - Math.exp(-4.5 * swing) * Math.cos(2.6 * Math.PI * swing);
  const fall = phase(progress, BEATS.fall);
  return {
    angle: swing === 0 ? 0 : SWING_DEG * settle + 30 * fall * fall,
    drop: 1.6 * fall * fall,
  };
}

/**
 * How to pin the HTML word to its plane in the hallway: with CSS perspective
 * set to the camera's focal length in pixels, moving the word towards the
 * viewer by (distance walked) × (pixels per metre at the word) matches the
 * 3D camera exactly. Before the walk it drifts down a little, to hang nearer
 * eye level. It fades out just before the camera reaches it.
 */
export function wordView(
  cameraZ: number,
  viewportHeight: number,
  progress: number,
): { perspective: number; translateY: number; translateZ: number; opacity: number } {
  const perspective = viewportHeight / 2 / Math.tan((LAYOUT.fov * Math.PI) / 360);
  const { startZ, wordZ } = LAYOUT.hallway;
  const gap = startZ - wordZ;
  const walked = Math.min(startZ - cameraZ, gap * 0.95);
  const left = cameraZ - wordZ; // metres still between the camera and the word
  const drift = smootherstep(progress, BEATS.fall[0], BEATS.hallway[0]);
  return {
    perspective,
    translateY: drift * LAYOUT.hallway.wordDrift * viewportHeight,
    translateZ: (walked * perspective) / gap,
    opacity: Math.min(1, Math.max(0, (left - 0.25 * gap) / (0.25 * gap))),
  };
}
