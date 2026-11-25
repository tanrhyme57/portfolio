import { describe, expect, it } from 'vitest';
import { anchorOffset, TIMELINE, timelineVars } from './timeline';

describe('timelineVars', () => {
  it('starts with everything closed', () => {
    const vars = timelineVars(0);
    expect(vars['--doors']).toBe('0.0000');
    expect(vars['--stats']).toBe('0.0000');
  });

  it('ends with everything open', () => {
    const vars = timelineVars(1);
    for (const value of Object.values(vars)) expect(value).toBe('1.0000');
  });
});

describe('anchorOffset', () => {
  it('lands a jump at the requested progress', () => {
    const screens = TIMELINE.length;
    // Scrolling the anchor to the top scrolls anchorOffset * screens screens,
    // and progress is that divided by the scrollable distance.
    const progress = (anchorOffset(0.85) * screens) / (screens - 1);
    expect(progress).toBeCloseTo(0.85);
  });
});
