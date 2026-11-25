import { describe, expect, it } from 'vitest';
import { coverLineX } from './coverFit';

const image = { width: 3840, height: 2160 };

describe('coverLineX', () => {
  it('maps directly when the aspect ratios match', () => {
    expect(coverLineX({ width: 1920, height: 1080 }, image, 0.5)).toBe(960);
  });

  it('accounts for horizontal cropping on tall screens', () => {
    // 390x844 phone: image is scaled to 844px tall, so it is 1500.4px wide and centred.
    const x = coverLineX({ width: 390, height: 844 }, image, 0.5);
    expect(x).toBeCloseTo(195);
    const left = coverLineX({ width: 390, height: 844 }, image, 0);
    expect(left).toBeLessThan(0);
  });

  it('keeps an off-centre line in proportion on wide screens', () => {
    const x = coverLineX({ width: 3000, height: 1000 }, image, 0.6);
    expect(x).toBeCloseTo(1800);
  });
});
