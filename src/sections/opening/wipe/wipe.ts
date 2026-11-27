/**
 * The hand that wipes the plaster off the screen. Pure geometry in screen
 * pixels: the cloth's path (back and forth, top to bottom), how wide a track
 * it leaves, and where the hand is at any point along it.
 */

/** Measurements of the hand image (wipe-hand.webp), as fractions of its size. */
export const HAND = {
  /** Image width over height. */
  aspect: 1600 / 1138,
  /** Centre of the cloth. */
  cloth: { x: 0.1649, y: 0.2972 },
  /** Width of the cloth. */
  clothWidth: 0.187,
  /** Direction from the cloth to the cut end of the arm, in degrees (y down). */
  armAngleDeg: 30.9,
  /** Length of the arm from the cloth, in cloth widths. */
  armReach: 5.2,
} as const;

/** Where the arm comes from, as a share of the screen: off the bottom-right corner. */
const SHOULDER = { x: 1.15, y: 1.2 };
/** Left and right turning points of each stroke, as shares of the screen width. */
const EDGES = { left: 0.06, right: 0.94 };
/** Track width over cloth width (a little narrower: the cloth is not pressed flat). */
const TRACK = 0.95;
/** Row spacing over track width, so neighbouring strokes overlap. */
const OVERLAP = 0.8;
/** Samples per segment when smoothing the path. */
const SMOOTHING = 20;

type Point = readonly [number, number];

export interface WipePlan {
  /** The smoothed path, densely sampled. */
  points: Point[];
  /** Distance along the path at each point. */
  lengths: number[];
  /** Length of the wiping path. */
  total: number;
  /** After wiping, the hand pulls back along the arm by this much, off screen. */
  retract: number;
  /** Width of the wiped track, in pixels. */
  stroke: number;
  /** Width of the hand image on screen, in pixels. */
  handWidth: number;
  shoulder: Point;
}

export function planWipe(width: number, height: number): WipePlan {
  const shoulder: Point = [SHOULDER.x * width, SHOULDER.y * height];
  const left = EDGES.left * width;
  const right = EDGES.right * width;

  // The cloth is sized so the arm always reaches back off screen, even at the
  // far top-left corner of the wipe.
  const reach = Math.hypot(shoulder[0] - left, shoulder[1]);
  const cloth = (reach * 1.05) / HAND.armReach;
  const stroke = cloth * TRACK;

  const top = Math.min(0.1 * height, stroke * 0.4);
  const bottom = height - top;
  const rows = Math.max(2, Math.ceil((bottom - top) / (stroke * OVERLAP)) + 1);

  // Back and forth, top to bottom, starting from the side the arm comes from.
  const controls: Point[] = [[width + cloth, 0.6 * height]];
  for (let row = 0; row < rows; row++) {
    const y = top + ((bottom - top) * row) / (rows - 1);
    const [from, to] = row % 2 === 0 ? [right, left] : [left, right];
    controls.push([from, y], [to, y]);
  }
  const points = smooth(controls);
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]!;
    const [x1, y1] = points[i]!;
    lengths.push(lengths[i - 1]! + Math.hypot(x1 - x0, y1 - y0));
  }
  const [endX, endY] = points[points.length - 1]!;
  return {
    points,
    lengths,
    total: lengths[lengths.length - 1]!,
    retract: Math.hypot(shoulder[0] - endX, shoulder[1] - endY) + cloth,
    stroke,
    handWidth: cloth / HAND.clothWidth,
    shoulder,
  };
}

/** SVG path data for the plan. */
export function pathData(plan: WipePlan): string {
  return plan.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
}

/**
 * The cloth's position, the hand's rotation (degrees) and how much of the
 * path is wiped, at `t` (0..1). The last part of `t` pulls the hand back out
 * along its arm, so it never swings round.
 */
export function wipeAt(
  plan: WipePlan,
  t: number,
): { x: number; y: number; rotation: number; wiped: number } {
  const travel = Math.min(1, Math.max(0, t)) * (plan.total + plan.retract);
  if (travel > plan.total) {
    const end = wipeAt(plan, plan.total / (plan.total + plan.retract));
    const angle = ((end.rotation + HAND.armAngleDeg) * Math.PI) / 180;
    const back = travel - plan.total;
    return {
      ...end,
      x: end.x + Math.cos(angle) * back,
      y: end.y + Math.sin(angle) * back,
    };
  }
  const distance = travel;
  let i = 1;
  while (i < plan.lengths.length - 1 && plan.lengths[i]! < distance) i++;
  const span = plan.lengths[i]! - plan.lengths[i - 1]!;
  const f = span > 0 ? (distance - plan.lengths[i - 1]!) / span : 0;
  const [x0, y0] = plan.points[i - 1]!;
  const [x1, y1] = plan.points[i]!;
  const x = x0 + (x1 - x0) * f;
  const y = y0 + (y1 - y0) * f;
  const toShoulder = Math.atan2(plan.shoulder[1] - y, plan.shoulder[0] - x);
  return { x, y, rotation: (toShoulder * 180) / Math.PI - HAND.armAngleDeg, wiped: distance };
}

/** Catmull-Rom through the control points, so the turns are round like a real arm's. */
function smooth(controls: Point[]): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < controls.length - 1; i++) {
    const p0 = controls[Math.max(0, i - 1)]!;
    const p1 = controls[i]!;
    const p2 = controls[i + 1]!;
    const p3 = controls[Math.min(controls.length - 1, i + 2)]!;
    for (let s = 0; s < SMOOTHING; s++) {
      const t = s / SMOOTHING;
      const t2 = t * t;
      const t3 = t2 * t;
      const at = (a: number, b: number, c: number, d: number) =>
        0.5 *
        (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([at(p0[0], p1[0], p2[0], p3[0]), at(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(controls[controls.length - 1]!);
  return out;
}
