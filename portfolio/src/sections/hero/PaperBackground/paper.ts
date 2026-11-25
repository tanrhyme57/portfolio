import paperUrl from '@/assets/textures/paper-grid.webp';

/** The folded paper image: its pixel size and where its bright fold line sits (fraction of width). */
export const PAPER = {
  url: paperUrl,
  width: 2560,
  height: 1440,
  foldU: 0.5957,
} as const;
