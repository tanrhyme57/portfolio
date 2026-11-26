import type { SwarmConfig } from './config';

/** Where every bot wants to be this frame. One entry per bot. */
export interface Slots {
  readonly count: number;
  /** xyz per bot, world units. */
  readonly position: Float32Array;
  /** Rotation around the vertical axis per bot, radians. */
  readonly yaw: Float32Array;
  /** Forward tilt per bot, radians. Bots in the mass tilt so their broad side faces out. */
  readonly pitch: Float32Array;
  /** 0 for the bots holding the orb, up to 1 for the mass at the anchor. Drives stiffness. */
  readonly weight: Float32Array;
  /** Number of bots that are part of the column this frame (the rest are in the mass). */
  columnCount: number;
}

export interface FormationInput {
  /** The column's free end, right at the orb. World units. */
  tipX: number;
  tipY: number;
  /**
   * World y of the edge the column grows out of. Above the tip the column
   * hangs from the ceiling; below it, it stands on a floor.
   */
  anchorY: number;
  /** Bot length, world units. */
  botSize: number;
  time: number;
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const TAU = Math.PI * 2;

export function createSlots(count: number): Slots {
  return {
    count,
    position: new Float32Array(count * 3),
    yaw: new Float32Array(count),
    pitch: new Float32Array(count),
    weight: new Float32Array(count),
    columnCount: 0,
  };
}

/** Number of bots on each ring of the column, tip ring first. */
export function ringSizes(
  length: number,
  botSize: number,
  count: number,
  column: SwarmConfig['column'],
): number[] {
  const rowGap = column.rowSpacing * botSize;
  const rows = Math.max(1, Math.floor(Math.max(0, length) / rowGap) + 1);

  const sizes: number[] = [];
  for (let r = 0; r < rows; r++) {
    const radius = ringRadius(r * column.rowSpacing, column);
    sizes.push(Math.max(column.minRing, Math.round((TAU * radius) / column.ringSpacing)));
  }

  // Not enough bots for a full column: every ring keeps its minimum and the
  // rest of the budget is shared out in proportion to what each ring wanted.
  const budget = Math.floor(count * (1 - column.minPoolShare));
  const total = sizes.reduce((sum, n) => sum + n, 0);
  const floor = rows * column.minRing;
  if (total > budget && total > floor) {
    const factor = Math.max(0, budget - floor) / (total - floor);
    for (let r = 0; r < rows; r++) {
      sizes[r] = column.minRing + Math.floor((sizes[r]! - column.minRing) * factor);
    }
  }
  return sizes;
}

/** Ring radius in bot lengths at `depth` bot lengths from the tip. */
function ringRadius(depth: number, column: SwarmConfig['column']): number {
  return column.topRadius + column.flare * Math.pow(depth, column.flarePower);
}

/**
 * Fills `out` with the target for every bot: a flared, writhing column of
 * rings from the anchor edge to the orb, with the leftover bots in a
 * crawling mass along the anchor edge that the column grows out of.
 *
 * Bot i always gets slot i, and slots are numbered from the tip. So the bots
 * holding the orb never change, and when the column gets longer the extra
 * bots come out of the mass.
 */
export function computeFormation(out: Slots, input: FormationInput, config: SwarmConfig): void {
  const { tipX, tipY, anchorY, botSize: s, time } = input;
  const { column, pool, depthScale, motion } = config;
  const direction = anchorY >= tipY ? 1 : -1; // +1: column goes up from the tip
  const length = Math.abs(anchorY - tipY);
  const sizes = ringSizes(length, s, out.count, column);
  const lastRow = Math.max(1, sizes.length - 1);

  let i = 0;
  for (let r = 0; r < sizes.length && i < out.count; r++) {
    const ring = sizes[r]!;
    const depth = r * column.rowSpacing;
    const along = r / lastRow; // 0 at the tip, 1 at the anchor

    // A bulge that travels from the anchor to the tip, like swallowing.
    const pulse =
      1 + motion.pulse * Math.sin(depth * motion.pulseFrequency + time * motion.pulseSpeed);
    const radius = ringRadius(depth, column) * s * pulse;

    // The middle swings while both ends stay put.
    const sway =
      Math.sin(Math.PI * along) *
      motion.sway *
      length *
      Math.sin(time * motion.swaySpeed + along * 2.4);

    const y = tipY + direction * depth * s;
    const spin = r % 2 === 0 ? 1 : -1;
    const phase = r * column.twist + time * column.spin * spin;

    for (let j = 0; j < ring && i < out.count; j++, i++) {
      const angle = phase + (j / ring) * TAU + jitter(i, time, motion.jitterSpeed, 0) * 0.35;
      const wobble = 1 + jitter(i, time, motion.jitterSpeed, 1) * motion.jitter;
      out.position[i * 3] = tipX + sway + Math.cos(angle) * radius * wobble;
      out.position[i * 3 + 1] = y + jitter(i, time, motion.jitterSpeed, 2) * motion.jitter * s;
      out.position[i * 3 + 2] = Math.sin(angle) * radius * wobble * depthScale;
      // Long axis along the ring, like bricks in a round wall.
      out.yaw[i] = -angle - Math.PI / 2;
      out.pitch[i] = 0;
      out.weight[i] = along;
    }
  }
  out.columnCount = i;

  // Everyone else: a thick blanket of bots along the anchor edge, spanning
  // the whole width. It is thickest at the column's root so the column grows
  // out of it without a seam, and never thinner than `pool.edge` so no
  // background shows between the bots and the edge.
  const rootRadius = ringRadius(lastRow * column.rowSpacing, column) * s;
  const massCount = out.count - out.columnCount;
  for (let k = 0; i < out.count; i++, k++) {
    // Spots are spread evenly (stratified) so there are no holes, and depend
    // only on the bot's index so the mass does not reshuffle.
    const side = ((k + 0.5) / massCount) * 2 - 1; // -1..1, left to right
    const order = fract(i * 0.618034);
    const reach = Math.abs(side);
    const thickness = (pool.edge + (pool.mound - pool.edge) * Math.pow(1 - reach, 2)) * s;
    const crawl = Math.sin(time * pool.spin * (0.6 + fract(i * 0.29)) + i * 1.7) * s * 0.5;
    out.position[i * 3] = tipX * (1 - reach) + side * (rootRadius + pool.spread * s) + crawl;
    out.position[i * 3 + 1] = anchorY - direction * order * thickness;
    out.position[i * 3 + 2] = (fract(i * 0.7548776) - 0.5) * 2 * (rootRadius + s) * pool.depthScale;
    out.yaw[i] = i * GOLDEN_ANGLE + time * pool.spin * 0.3;
    out.pitch[i] = (i % 2 === 0 ? 1 : -1) * (0.9 + 0.6 * fract(i * 0.381966));
    out.weight[i] = 1;
  }
}

/** Smooth per-bot wiggle in -1..1; `channel` gives independent wiggles for the same bot. */
function jitter(i: number, time: number, speed: number, channel: number): number {
  const seed = i * 12.9898 + channel * 78.233;
  const rate = speed * (0.6 + fract(seed * 0.1031));
  return Math.sin(time * rate + seed) * 0.6 + Math.sin(time * rate * 2.3 + seed * 1.7) * 0.4;
}

function fract(value: number): number {
  return value - Math.floor(value);
}
