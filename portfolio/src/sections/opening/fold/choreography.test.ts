import { describe, expect, it } from 'vitest';
import { mirrored, planFold, poseAt } from './choreography';
import { buildTiles } from './tileGrid';

const tiles = buildTiles();
const viewport = { width: 1440, height: 900 };
const plan = planFold(tiles, 'experience', viewport);

describe('planFold', () => {
  it('gives every letter square a tile when there is enough paper', () => {
    const used = plan.targets.filter(Boolean).length;
    expect(used).toBe(plan.layout.cells.length);
  });

  it('builds the first half of the word from the left half of the paper', () => {
    plan.targets.forEach((target, i) => {
      if (!target) return;
      expect(tiles[i]!.side < 0).toBe(target.letter < 5);
    });
  });

  it('takes squares from the seam first', () => {
    const first = plan.rank.findIndex((r, i) => r === 0 && plan.targets[i]);
    expect(tiles[first]!.column).toBe(0);
  });
});

describe('poseAt', () => {
  it('leaves every square in place at the start', () => {
    const atStart = poseAt(plan, 0, 0);
    expect(atStart.rotateY).toBeCloseTo(0);
    expect(atStart.scale).toBe(1);
  });

  it('lands letter squares inside the screen with their shape', () => {
    plan.targets.forEach((target, i) => {
      if (!target) return;
      const pose = poseAt(plan, i, 1);
      const cx = pose.x + pose.size / 2;
      expect(cx).toBeGreaterThan(0);
      expect(cx).toBeLessThan(viewport.width);
      expect(pose.shape).toBe(target.shape);
    });
  });

  it('sends the unused paper off screen', () => {
    plan.targets.forEach((target, i) => {
      if (target) return;
      const pose = poseAt(plan, i, 1);
      expect(pose.x > viewport.width || pose.x + pose.size < 0).toBe(true);
    });
  });
});

describe('mirrored', () => {
  it('swaps left and right corners', () => {
    expect(mirrored('tl')).toBe('tr');
    expect(mirrored('br')).toBe('bl');
    expect(mirrored('full')).toBe('full');
  });
});
