import backdropUrl from '@/assets/textures/opening/backdrop.webp';
import doorLeftUrl from '@/assets/textures/opening/door-left.webp';
import doorRightUrl from '@/assets/textures/opening/door-right.webp';
import paperLightUrl from '@/assets/textures/opening/paper-light.webp';

/**
 * The layers of the opening artwork (exported from the Affinity file).
 * Positions are fractions of the 3840×2160 artboard, so they stay correct
 * at any screen size.
 */
export const ARTBOARD = { width: 3840, height: 2160 } as const;

export const PAPER = {
  /** Dark plaster revealed when the doors open. */
  backdrop: backdropUrl,
  left: { url: doorLeftUrl, x: 0, width: 2299 / 3840 },
  right: { url: doorRightUrl, x: 2276 / 3840, width: 1564 / 3840 },
  /** Where the two halves meet (middle of their overlap). */
  foldU: 2287.5 / 3840,
  /** Light, unshaded version of the folded paper for things built "out of" it. */
  light: paperLightUrl,
} as const;
