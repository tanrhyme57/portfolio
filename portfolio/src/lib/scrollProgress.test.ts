import { describe, expect, it } from 'vitest';
import { phase, scrollProgress } from './scrollProgress';

describe('scrollProgress', () => {
  it('is 0 before the element reaches the top', () => {
    expect(scrollProgress(200, 3000, 1000)).toBe(0);
  });

  it('runs from 0 to 1 over the scrollable distance', () => {
    expect(scrollProgress(0, 3000, 1000)).toBe(0);
    expect(scrollProgress(-1000, 3000, 1000)).toBe(0.5);
    expect(scrollProgress(-2000, 3000, 1000)).toBe(1);
    expect(scrollProgress(-5000, 3000, 1000)).toBe(1);
  });

  it('handles elements no taller than the screen', () => {
    expect(scrollProgress(0, 800, 1000)).toBe(1);
    expect(scrollProgress(10, 800, 1000)).toBe(0);
  });
});

describe('phase', () => {
  it('maps a range to 0..1 and clamps', () => {
    expect(phase(0.25, [0.2, 0.3])).toBeCloseTo(0.5);
    expect(phase(0.1, [0.2, 0.3])).toBe(0);
    expect(phase(0.9, [0.2, 0.3])).toBe(1);
  });
});
