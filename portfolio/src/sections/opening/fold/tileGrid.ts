import { ARTBOARD } from '../paper/paper';

/**
 * The square grid printed on the paper halves, in artboard pixels
 * (measured from the Affinity artwork). Both halves start at the seam.
 */
export const GRID = {
  seamX: 2288,
  pitch: 228.6,
  /** y of the top edge of the first (partly hidden) row. */
  top: -58,
  rows: 10,
  /** Columns from the seam to the outer edge on each side. */
  columns: { left: 10, right: 7 },
} as const;

export type Side = -1 | 1;

/** One square of paper, in artboard pixels. */
export interface Tile {
  side: Side;
  /** 0 = the column at the seam, counting outwards. */
  column: number;
  row: number;
  x: number;
  y: number;
}

/** Every square of both halves. */
export function buildTiles(): Tile[] {
  const tiles: Tile[] = [];
  for (const side of [-1, 1] as const) {
    const columns = side < 0 ? GRID.columns.left : GRID.columns.right;
    for (let column = 0; column < columns; column++) {
      const x =
        side < 0 ? GRID.seamX - (column + 1) * GRID.pitch : GRID.seamX + column * GRID.pitch;
      for (let row = 0; row < GRID.rows; row++) {
        tiles.push({ side, column, row, x, y: GRID.top + row * GRID.pitch });
      }
    }
  }
  return tiles;
}

/** How the artboard is scaled and placed to cover a viewport (like background-size: cover). */
export interface CoverFit {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function coverFit(width: number, height: number): CoverFit {
  const scale = Math.max(width / ARTBOARD.width, height / ARTBOARD.height);
  return {
    scale,
    offsetX: (width - ARTBOARD.width * scale) / 2,
    offsetY: (height - ARTBOARD.height * scale) / 2,
  };
}
