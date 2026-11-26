/** Which part of a grid square is paper: all of it, or the half-square triangle in one corner. */
export type CellShape = 'full' | 'tl' | 'tr' | 'bl' | 'br';

export interface GlyphCells {
  /** Advance width in grid units, side bearings included. */
  advance: number;
  /** [x, y, shape] per paper square, x right and y up from the glyph origin. */
  cells: [number, number, CellShape][];
}
