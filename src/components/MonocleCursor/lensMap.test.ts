import { describe, expect, it } from 'vitest';
import { lensMap } from './lensMap';

const size = 32;
const at = (map: Uint8ClampedArray, i: number, j: number) => {
  const k = (j * size + i) * 4;
  return [map[k]!, map[k + 1]!];
};

describe('lensMap', () => {
  const map = lensMap(size, { bulge: 0.4, swirl: 0 });

  it('leaves the corners (outside the lens) alone', () => {
    expect(at(map, 0, 0)).toEqual([128, 128]);
  });

  it('pulls towards the centre, so the middle looks magnified', () => {
    const [right] = at(map, 24, 16); // right of centre: samples further left
    const [left] = at(map, 8, 16);
    expect(right).toBeLessThan(128);
    expect(left).toBeGreaterThan(128);
  });

  it('stays inside the 0..255 range with a strong swirl', () => {
    const strong = lensMap(size, { bulge: 0.5, swirl: 0.3 });
    expect(Math.min(...strong)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...strong)).toBeLessThanOrEqual(255);
  });
});
