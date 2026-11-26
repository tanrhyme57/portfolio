import { Vector2, Vector3 } from 'three';
import { layoutWord, type WordCell } from '@/sections/opening/fold/wordLayout';
import {
  eyePose,
  LAYOUT,
  ROOM_BACK_Z,
  ROOM_FLOOR_Y,
  STAIRS_BOTTOM_Z,
  STAIRS_TOP_Z,
} from './layout';

/**
 * The forced-perspective drawing. It is designed flat, on a plane a fixed
 * distance in front of the eye point, then every piece is pushed k times
 * farther from the eye and scaled k times bigger, with a different k each.
 * From the eye nothing changes; from anywhere else the drawing falls apart.
 */

/** Distance from the eye to the design plane, in metres. */
const DESIGN_DISTANCE = 4;
/** Width of the paper strips that draw the doorway and the path, in design metres. */
const STRIP = 0.03;
/** Depth factors handed out to the pieces in turn: a scattered but fixed look. */
const DEPTHS = [1.6, 0.7, 1.3, 0.62, 1.85, 0.9, 1.45, 0.78, 1.7, 1.1, 0.66, 1.5, 0.95];

export interface IllusionPiece {
  kind: 'letter' | 'strip';
  /** Flat triangles (x, y, 0) in the piece's own plane, at design scale. */
  triangles: Float32Array;
  /** Where the piece really is, and how much it is scaled up to look the same. */
  position: Vector3;
  scale: number;
}

interface DesignPiece {
  kind: IllusionPiece['kind'];
  /** Centre on the design plane: u right, v up, in metres. */
  centre: Vector2;
  /** Corners relative to the centre, three per triangle. */
  corners: Vector2[];
}

/** Moves `point` k times farther from `eye` along the line between them. */
export function pushFromEye(eye: Vector3, point: Vector3, k: number): Vector3 {
  return point.clone().sub(eye).multiplyScalar(k).add(eye);
}

/** The whole drawing for a landscape or portrait screen (portrait wraps the word). */
export function illusionPieces(portrait: boolean): IllusionPiece[] {
  const eye = eyePose();
  const toWorld = (u: number, v: number) =>
    eye.position
      .clone()
      .addScaledVector(eye.forward, DESIGN_DISTANCE)
      .addScaledVector(eye.right, u)
      .addScaledVector(eye.up, v);
  const toDesign = (point: Vector3) => {
    const d = point.clone().sub(eye.position);
    const t = DESIGN_DISTANCE / d.dot(eye.forward);
    return new Vector2(d.dot(eye.right) * t, d.dot(eye.up) * t);
  };

  const design = drawing(toDesign, portrait);
  return design.map((piece, i) => {
    const corners = piece.corners.map((c) => toWorld(piece.centre.x + c.x, piece.centre.y + c.y));
    const k = Math.min(DEPTHS[i % DEPTHS.length]!, maxDepth(eye.position, corners));
    return {
      kind: piece.kind,
      triangles: new Float32Array(piece.corners.flatMap((c) => [c.x, c.y, 0])),
      position: pushFromEye(eye.position, toWorld(piece.centre.x, piece.centre.y), k),
      scale: k,
    };
  });
}

/** The flat drawing: a doorway standing on the real stairs, the stairs' edges, and the word. */
function drawing(toDesign: (p: Vector3) => Vector2, portrait: boolean): DesignPiece[] {
  const half = LAYOUT.stairs.width / 2;
  const bottomLeft = toDesign(new Vector3(-half, ROOM_FLOOR_Y, STAIRS_BOTTOM_Z));
  const bottomRight = toDesign(new Vector3(half, ROOM_FLOOR_Y, STAIRS_BOTTOM_Z));
  const topLeft = toDesign(new Vector3(-half, 0, STAIRS_TOP_Z));
  const topRight = toDesign(new Vector3(half, 0, STAIRS_TOP_Z));

  const doorWidth = bottomRight.x - bottomLeft.x;
  const doorHeight = doorWidth * (portrait ? 1.35 : 1.55);
  const doorTop = bottomLeft.y + doorHeight;
  const lintelLeft = new Vector2(bottomLeft.x - STRIP / 2, doorTop);
  const lintelRight = new Vector2(bottomRight.x + STRIP / 2, doorTop);

  return [
    strip(bottomLeft, new Vector2(bottomLeft.x, doorTop)),
    strip(bottomRight, new Vector2(bottomRight.x, doorTop)),
    strip(lintelLeft, lintelRight),
    strip(topLeft, bottomLeft),
    strip(topRight, bottomRight),
    ...word(portrait ? ['proj', 'ects'] : ['projects'], portrait ? 1.0 : 2.2, doorTop + 0.12),
  ];
}

function strip(a: Vector2, b: Vector2): DesignPiece {
  const centre = a.clone().add(b).multiplyScalar(0.5);
  const along = b.clone().sub(a).multiplyScalar(0.5);
  const across = new Vector2(-along.y, along.x).setLength(STRIP / 2);
  const p0 = along.clone().negate().sub(across);
  const p1 = along.clone().sub(across);
  const p2 = along.clone().add(across);
  const p3 = along.clone().negate().add(across);
  return { kind: 'strip', centre, corners: [p0, p1, p2, p0, p2, p3] };
}

/** The word in Paperfold, one piece per letter, its bottom edge at `bottom`. */
function word(lines: string[], width: number, bottom: number): DesignPiece[] {
  const layout = layoutWord(lines);
  const unit = width / layout.width;
  const top = bottom + layout.height * unit;
  const left = -width / 2;

  const letters = new Map<number, WordCell[]>();
  for (const cell of layout.cells) {
    letters.set(cell.letter, [...(letters.get(cell.letter) ?? []), cell]);
  }

  return [...letters.values()].map((cells) => {
    const minX = Math.min(...cells.map((c) => c.x));
    const maxX = Math.max(...cells.map((c) => c.x)) + 1;
    const minY = Math.min(...cells.map((c) => c.y));
    const maxY = Math.max(...cells.map((c) => c.y)) + 1;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const corners = cells.flatMap((cell) =>
      cellTriangles(cell).map(([x, y]) => new Vector2((x - cx) * unit, (cy - y) * unit)),
    );
    return {
      kind: 'letter' as const,
      centre: new Vector2(left + cx * unit, top - cy * unit),
      corners,
    };
  });
}

/** Grid square (or its half) as triangles, in grid units with y down. */
function cellTriangles({ x, y, shape }: WordCell): [number, number][] {
  const tl: [number, number] = [x, y];
  const tr: [number, number] = [x + 1, y];
  const bl: [number, number] = [x, y + 1];
  const br: [number, number] = [x + 1, y + 1];
  switch (shape) {
    case 'full':
      return [tl, bl, br, tl, br, tr];
    case 'tl':
      return [tl, bl, tr];
    case 'tr':
      return [tl, br, tr];
    case 'bl':
      return [tl, bl, br];
    case 'br':
      return [tr, bl, br];
  }
}

/** Largest push that keeps every corner inside the room: above the floor, before the back wall. */
function maxDepth(eye: Vector3, corners: Vector3[]): number {
  const margin = 0.15;
  const halfWidth = LAYOUT.room.width / 2 - margin;
  let k = Infinity;
  for (const corner of corners) {
    const d = corner.clone().sub(eye);
    if (d.y < 0) k = Math.min(k, (eye.y - ROOM_FLOOR_Y - margin) / -d.y);
    if (d.z < 0) k = Math.min(k, (eye.z - ROOM_BACK_Z - margin) / -d.z);
    if (d.x !== 0) k = Math.min(k, (halfWidth - Math.sign(d.x) * eye.x) / Math.abs(d.x));
  }
  return k;
}
