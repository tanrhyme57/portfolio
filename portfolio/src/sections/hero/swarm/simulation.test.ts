import { describe, expect, it } from 'vitest';
import { desktopSwarm, type SwarmConfig } from './config';
import { computeFormation, createSlots } from './formation';
import { createSwarmState, stepSwarm, twitchSwarm } from './simulation';

const config: SwarmConfig = { ...desktopSwarm, count: 120 };
const bounds = { width: 10, height: 6 };
const botSize = config.botSize * bounds.height;

function settle(seconds: number) {
  const slots = createSlots(config.count);
  computeFormation(slots, { tipX: 0, tipY: -1, anchorY: 3, botSize, time: 0 }, config);
  const state = createSwarmState(config, bounds, { random: () => 0.5 });
  const dt = 1 / 60;
  for (let t = 0; t < seconds; t += dt) stepSwarm(state, slots, config, dt, t, bounds.height);
  return { state, slots };
}

describe('stepSwarm', () => {
  it('starts every bot above the visible area', () => {
    const state = createSwarmState(config, bounds);
    for (let i = 0; i < state.count; i++) {
      expect(state.position[i * 3 + 1]!).toBeGreaterThan(bounds.height / 2);
    }
  });

  it('brings every bot onto its slot', () => {
    const { state, slots } = settle(8);
    for (let i = 0; i < state.position.length; i++) {
      expect(state.position[i]!).toBeCloseTo(slots.position[i]!, 2);
    }
  });

  it('never moves a bot faster than the speed cap', () => {
    const slots = createSlots(config.count);
    computeFormation(slots, { tipX: 0, tipY: -1, anchorY: 3, botSize, time: 0 }, config);
    const state = createSwarmState(config, bounds, { instant: true });
    stepSwarm(state, slots, config, 1 / 60, 0, bounds.height);
    const cap = config.spring.maxSpeed * bounds.height;
    for (let i = 0; i < state.count; i++) {
      const [vx, vy, vz] = [0, 1, 2].map((a) => state.velocity[i * 3 + a]!);
      expect(Math.hypot(vx!, vy!, vz!)).toBeLessThanOrEqual(cap + 1e-4);
    }
  });

  it('holds bots still until their turn to drop', () => {
    const slots = createSlots(config.count);
    const state = createSwarmState(config, bounds);
    const before = state.position.slice();
    stepSwarm(state, slots, config, 1 / 60, 0, bounds.height);
    expect(state.position).toEqual(before);
  });

  it('twitches only bots that have already dropped in', () => {
    const state = createSwarmState(config, bounds);
    twitchSwarm(state, { ...config.motion, twitchRate: 1e6 }, 1 / 60, 0, bounds.height, () => 0);
    expect(state.velocity.every((v) => v === 0)).toBe(true);
  });
});
