import { describe, expect, it } from 'vitest';
import { HAND, planWipe, wipeAt } from './wipe';

const screens = [
  [1440, 900],
  [390, 844],
] as const;

describe('planWipe', () => {
  for (const [width, height] of screens) {
    const plan = planWipe(width, height);

    it(`comes in and leaves off screen (${width}×${height})`, () => {
      const clothPx = plan.handWidth * HAND.clothWidth;
      expect(wipeAt(plan, 0).x).toBeGreaterThan(width + clothPx / 2);
      const end = wipeAt(plan, 1);
      expect(end.x > width + clothPx || end.y > height + clothPx).toBe(true);
    });

    it(`wipes every part of the screen (${width}×${height})`, () => {
      const radius = plan.stroke / 2;
      for (let x = 0; x <= width; x += width / 12) {
        for (let y = 0; y <= height; y += height / 12) {
          const covered = plan.points.some(([px, py]) => Math.hypot(px - x, py - y) <= radius);
          expect(covered, `${x.toFixed(0)}, ${y.toFixed(0)}`).toBe(true);
        }
      }
    });

    it(`keeps the cut end of the arm off screen (${width}×${height})`, () => {
      const clothPx = plan.handWidth * HAND.clothWidth;
      for (let t = 0; t <= 1; t += 0.02) {
        const { x, y, rotation } = wipeAt(plan, t);
        const angle = ((rotation + HAND.armAngleDeg) * Math.PI) / 180;
        const endX = x + Math.cos(angle) * HAND.armReach * clothPx;
        const endY = y + Math.sin(angle) * HAND.armReach * clothPx;
        expect(endX > width || endY > height, `${t} ${x} ${y} ${endX} ${endY}`).toBe(true);
      }
    });
  }
});

describe('wipeAt', () => {
  it('wipes the whole path, then only pulls back', () => {
    const plan = planWipe(1440, 900);
    expect(wipeAt(plan, 0).wiped).toBe(0);
    const done = plan.total / (plan.total + plan.retract);
    expect(wipeAt(plan, done).wiped).toBeCloseTo(plan.total);
    expect(wipeAt(plan, 1).wiped).toBeCloseTo(plan.total);
    expect(wipeAt(plan, 1).rotation).toBeCloseTo(wipeAt(plan, done).rotation);
  });
});
