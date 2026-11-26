import { GLYPH_CELLS } from './glyphCells';
import type { CellShape } from './types';

/** One paper square of the laid-out word, in grid units from its top-left corner (y down). */
export interface WordCell {
  x: number;
  y: number;
  shape: CellShape;
  /** Index of the letter in the whole word. */
  letter: number;
}

export interface WordLayout {
  cells: WordCell[];
  /** Size of the word's bounding box, in grid units. */
  width: number;
  height: number;
}

/** Paperfold metrics in grid units: glyphs sit on y=0, reach y=5, and descend to y=-1. */
const ASCENT = 5;
const LINE_HEIGHT = 7;
const SIDE_BEARING = 0.5;

/**
 * Lays out text in Paperfold as grid squares, one entry per square. Letters
 * the font does not have are skipped. Each string in `lines` is one line,
 * centred on the widest.
 */
export function layoutWord(lines: readonly string[]): WordLayout {
  const raw: WordCell[] = [];
  const lineSpans: [number, number, number][] = []; // [first cell, end cell, width]
  let letter = 0;

  lines.forEach((line, lineIndex) => {
    const first = raw.length;
    let cursor = 0;
    for (const char of line.toLowerCase()) {
      const glyph = GLYPH_CELLS[char];
      if (glyph) {
        for (const [x, y, shape] of glyph.cells) {
          raw.push({
            x: cursor + SIDE_BEARING + x,
            y: lineIndex * LINE_HEIGHT + (ASCENT - 1 - y),
            shape,
            letter,
          });
        }
        cursor += glyph.advance;
      }
      letter++;
    }
    lineSpans.push([first, raw.length, cursor - 2 * SIDE_BEARING]);
  });

  // Centre every line on the widest one.
  const width = Math.max(0, ...lineSpans.map(([, , w]) => w));
  for (const [first, end, lineWidth] of lineSpans) {
    for (let i = first; i < end; i++) raw[i]!.x += (width - lineWidth) / 2 - SIDE_BEARING;
  }

  const minY = Math.min(...raw.map((c) => c.y));
  const maxY = Math.max(...raw.map((c) => c.y));
  for (const cell of raw) cell.y -= minY;
  return { cells: raw, width, height: raw.length ? maxY - minY + 1 : 0 };
}
