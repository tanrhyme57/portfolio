import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { illusionPieces, pushFromEye } from './illusion';
import { eyePose, ROOM_BACK_Z, ROOM_FLOOR_Y } from './layout';

/** Direction from the eye to a point, which is all the eye can see of it. */
const seen = (eye: Vector3, point: Vector3) => point.clone().sub(eye).normalize();

describe('pushFromEye', () => {
  it('keeps the point on the same line of sight', () => {
    const eye = new Vector3(0, 1.6, 0);
    const point = new Vector3(0.4, 1.2, -3);
    const pushed = pushFromEye(eye, point, 2.5);
    expect(seen(eye, pushed).distanceTo(seen(eye, point))).toBeLessThan(1e-9);
    expect(pushed.distanceTo(eye)).toBeCloseTo(point.distanceTo(eye) * 2.5);
  });
});

describe('illusionPieces', () => {
  for (const portrait of [false, true]) {
    const pieces = illusionPieces(portrait);
    const eye = eyePose().position;

    it(`draws the doorway, path and every letter (${portrait ? 'portrait' : 'landscape'})`, () => {
      expect(pieces.filter((p) => p.kind === 'strip')).toHaveLength(5);
      expect(pieces.filter((p) => p.kind === 'letter')).toHaveLength(8);
    });

    it('scatters pieces in depth but keeps them inside the room', () => {
      const depths = new Set(pieces.map((p) => p.scale.toFixed(2)));
      expect(depths.size).toBeGreaterThan(5);
      for (const piece of pieces) {
        expect(piece.position.y).toBeGreaterThan(ROOM_FLOOR_Y);
        expect(piece.position.z).toBeGreaterThan(ROOM_BACK_Z);
        expect(piece.position.z).toBeLessThan(eye.z);
      }
    });
  }
});
