import { describe, expect, it } from 'vitest';
import { desktopSwarm, type SwarmConfig } from './config';
import { computeFormation, createSlots, ringSizes } from './formation';

const botSize = 0.25;
// Column hangs from a ceiling at y=3 down to the figure at y=-1.
const input = { tipX: 1, tipY: -1, anchorY: 3, botSize, time: 0 };
// The organic motion is switched off so positions are exact.
const still: SwarmConfig = {
  ...desktopSwarm,
  motion: { ...desktopSwarm.motion, pulse: 0, sway: 0, jitter: 0 },
};

describe('ringSizes', () => {
  it('starts narrow at the tip and widens towards the anchor', () => {
    const sizes = ringSizes(5, botSize, 50000, still.column);
    expect(sizes.at(-1)!).toBeGreaterThan(sizes[0]!);
  });

  it('never uses more bots than the column budget allows', () => {
    const count = 300;
    const sizes = ringSizes(5, botSize, count, still.column);
    const total = sizes.reduce((a, b) => a + b, 0);
    const budget = count * (1 - still.column.minPoolShare);
    expect(total).toBeLessThanOrEqual(Math.max(budget, sizes.length * still.column.minRing));
  });
});

describe('computeFormation', () => {
  it('puts the first ring at the tip', () => {
    const slots = createSlots(still.count);
    computeFormation(slots, input, still);
    expect(slots.position[1]).toBeCloseTo(input.tipY);
    expect(slots.weight[0]).toBe(0);
  });

  it('keeps every bot between the tip and the anchor', () => {
    const slots = createSlots(still.count);
    computeFormation(slots, input, still);
    for (let i = 0; i < slots.count; i++) {
      const y = slots.position[i * 3 + 1]!;
      expect(y).toBeGreaterThanOrEqual(input.tipY - 1e-6);
      expect(y).toBeLessThanOrEqual(input.anchorY + 1e-6);
    }
  });

  it('also works standing on a floor (anchor below the tip)', () => {
    const slots = createSlots(still.count);
    computeFormation(slots, { ...input, tipY: 1, anchorY: -3 }, still);
    expect(slots.position[1]).toBeCloseTo(1);
    expect(slots.position[(slots.count - 1) * 3 + 1]!).toBeGreaterThanOrEqual(-3);
  });

  it('sends the leftover bots to the mass at the anchor', () => {
    const slots = createSlots(still.count);
    computeFormation(slots, input, still);
    expect(slots.columnCount).toBeLessThan(slots.count);
    expect(slots.weight[slots.count - 1]).toBe(1);
  });

  it('stays within a sensible distance when the motion is on', () => {
    const slots = createSlots(desktopSwarm.count);
    computeFormation(slots, { ...input, time: 12.3 }, desktopSwarm);
    for (let i = 0; i < slots.count; i++) {
      expect(Number.isFinite(slots.position[i * 3]!)).toBe(true);
      expect(Math.abs(slots.position[i * 3 + 1]! - 1)).toBeLessThan(3);
    }
  });
});
