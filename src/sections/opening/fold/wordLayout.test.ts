import { describe, expect, it } from 'vitest';
import { layoutWord } from './wordLayout';

describe('layoutWord', () => {
  it('starts at the top-left corner', () => {
    const { cells } = layoutWord(['experience']);
    expect(Math.min(...cells.map((c) => c.x))).toBe(0);
    expect(Math.min(...cells.map((c) => c.y))).toBe(0);
  });

  it('keeps every cell inside the reported size', () => {
    const layout = layoutWord(['exper', 'ience']);
    for (const cell of layout.cells) {
      expect(cell.x + 1).toBeLessThanOrEqual(layout.width + 1e-9);
      expect(cell.y + 1).toBeLessThanOrEqual(layout.height);
    }
  });

  it('numbers letters across lines', () => {
    const { cells } = layoutWord(['ab', 'c']);
    expect(Math.max(...cells.map((c) => c.letter))).toBe(2);
  });

  it('is twice as tall on two lines', () => {
    expect(layoutWord(['exper', 'ience']).height).toBeGreaterThan(
      layoutWord(['experience']).height,
    );
  });
});
