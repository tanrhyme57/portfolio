import { coverFit, GRID, type Side, type Tile } from './tileGrid';
import type { CellShape } from './types';
import { layoutWord, type WordCell, type WordLayout } from './wordLayout';

/**
 * How the paper turns into the word. Pure maths, no DOM: given scroll
 * progress through the fold phase (0..1) it says where every paper square is.
 *
 * Starting at the seam, squares fold over onto their own half (showing their
 * lighter back), then hop across, shrinking, into their place in the word.
 * The left half builds the first half of the word, the right half the rest.
 * Squares the word does not need slide off with their half to the sides.
 */

export interface Viewport {
  width: number;
  height: number;
}

export interface Pose {
  /** Top-left of the square before rotation/scale, viewport px. */
  x: number;
  y: number;
  /** Side length, viewport px (before `scale`). */
  size: number;
  scale: number;
  /** Rotation origin inside the square, px from its left edge (vertical centre). */
  originX: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  /** Shape to cut the square to, or null while it is still a whole square. */
  shape: CellShape | null;
}

export interface FoldPlan {
  tiles: Tile[];
  /** Word cell each tile becomes, or null if the tile slides away. */
  targets: (WordCell | null)[];
  /** For tiles with a target: 0..1 order in which they leave their half. */
  rank: number[];
  layout: WordLayout;
  viewport: Viewport;
}

/** Timing inside the fold phase (0..1). */
export const FOLD_TIMING = {
  /** When the first and last square start moving. */
  firstStart: 0.03,
  lastStart: 0.52,
  /** How long one square takes from folding over to landing. */
  duration: 0.34,
  /** Share of that spent on the first fold-over. */
  flip: 0.3,
  /** The halves slide out a little as they lose squares... */
  slide: [0.03, 0.3] as const,
  slideColumns: 1.2,
  /** ...then leave the screen. */
  exit: [0.56, 0.9] as const,
} as const;

/** Where the word sits: share of viewport height from the top, and max share of width it may use. */
const WORD_TOP = { landscape: 0.12, portrait: 0.08 };
const WORD_MAX_WIDTH = 0.86;
const WORD_MAX_HEIGHT = 0.26;

export function planFold(tiles: Tile[], word: string, viewport: Viewport): FoldPlan {
  const split = Math.ceil(word.length / 2);
  const halves = [word.slice(0, split), word.slice(split)];
  const portrait = viewport.height > viewport.width;
  const layout = layoutWord(portrait ? halves : [word]);

  const targets: (WordCell | null)[] = tiles.map(() => null);
  const rank: number[] = tiles.map(() => 0);

  for (const side of [-1, 1] as const) {
    // Squares leave starting at the seam, top to bottom, column by column.
    const sideTiles = tiles
      .map((tile, index) => ({ tile, index }))
      .filter(({ tile }) => tile.side === side)
      .sort((a, b) => a.tile.column - b.tile.column || a.tile.row - b.tile.row);
    // Letters fill from the middle of the word outwards, so the nearest
    // squares go to the nearest letters.
    const cells = layout.cells
      .filter((cell) => (side < 0 ? cell.letter < split : cell.letter >= split))
      .sort((a, b) => (side < 0 ? b.x - a.x : a.x - b.x) || a.y - b.y);

    const count = Math.min(cells.length, sideTiles.length);
    for (let i = 0; i < count; i++) {
      const { index } = sideTiles[i]!;
      targets[index] = cells[i]!;
      rank[index] = count > 1 ? i / (count - 1) : 0;
    }
  }
  return { tiles, targets, rank, layout, viewport };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeIn = (t: number) => t * t * t;
const range = (s: number, [a, b]: readonly [number, number]) => clamp01((s - a) / (b - a));

/** Mirror a triangle left-right (what a square looks like after flipping over). */
export function mirrored(shape: CellShape): CellShape {
  const flip: Record<CellShape, CellShape> = {
    full: 'full',
    tl: 'tr',
    tr: 'tl',
    bl: 'br',
    br: 'bl',
  };
  return flip[shape];
}

/** Repeatable 0..1 noise per tile. */
function noise(n: number): number {
  const x = Math.sin(n * 91.7 + 13.3) * 43758.5453;
  return x - Math.floor(x);
}

/** How far a half has slid outwards, in grid columns (before it exits). */
function slideColumns(s: number): number {
  return smooth(range(s, FOLD_TIMING.slide)) * FOLD_TIMING.slideColumns;
}

export function poseAt(plan: FoldPlan, index: number, s: number): Pose {
  const tile = plan.tiles[index]!;
  const target = plan.targets[index];
  const { width, height } = plan.viewport;
  const fit = coverFit(width, height);
  const size = GRID.pitch * fit.scale;
  const side: Side = tile.side;
  const homeX = tile.x * fit.scale + fit.offsetX;
  const homeY = tile.y * fit.scale + fit.offsetY;

  const base: Pose = {
    x: homeX,
    y: homeY,
    size,
    scale: 1,
    originX: size / 2,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    shape: null,
  };

  if (!target) {
    // Part of the half that slides out, then flies off its side.
    const exit = easeIn(range(s, FOLD_TIMING.exit));
    return {
      ...base,
      x: homeX + side * (slideColumns(s) * size + exit * width * 1.15),
      y: homeY - exit * height * 0.12,
      rotateZ: side * exit * 12,
    };
  }

  const { firstStart, lastStart, duration, flip } = FOLD_TIMING;
  const start = firstStart + plan.rank[index]! * (lastStart - firstStart);
  const u = clamp01((s - start) / duration);
  // Until it leaves, the square moves with its half.
  const x0 = homeX + side * slideColumns(Math.min(s, start)) * size;

  if (u <= flip) {
    // Fold over the outer edge, onto the neighbouring square.
    const a = smooth(u / flip);
    return { ...base, x: x0, originX: side < 0 ? 0 : size, rotateY: side * 180 * a };
  }

  // Hop into place in the word, shrinking, with a tumble on the way.
  const b = smooth((u - flip) / (1 - flip));
  const unit = Math.min(
    size,
    (width * WORD_MAX_WIDTH) / plan.layout.width,
    (height * WORD_MAX_HEIGHT) / plan.layout.height,
  );
  const wordLeft = (width - plan.layout.width * unit) / 2;
  const wordTop = height * (height > width ? WORD_TOP.portrait : WORD_TOP.landscape);

  const fromCx = x0 + side * size + size / 2;
  const fromCy = homeY + size / 2;
  const toCx = wordLeft + (target.x + 0.5) * unit;
  const toCy = wordTop + (target.y + 0.5) * unit;
  const arc = Math.sin(Math.PI * b) * height * 0.08;
  const cx = fromCx + (toCx - fromCx) * b;
  const cy = fromCy + (toCy - fromCy) * b - arc;
  const wobble = Math.sin(Math.PI * b) * (noise(index) - 0.5) * 50;

  return {
    ...base,
    x: cx - size / 2,
    y: cy - size / 2,
    scale: 1 + (unit / size - 1) * b,
    rotateY: side * (180 + 360 * b),
    rotateX: wobble,
    rotateZ: wobble * 0.6,
    shape: target.shape,
  };
}
