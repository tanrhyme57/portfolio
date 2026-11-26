import { describe, expect, it } from 'vitest';
import { BEATS } from './beats';
import { cameraZAt } from './handoff';
import { DOOR_TIMING, doorState } from './door';

describe('doorState', () => {
  it('stays shut until the walk starts', () => {
    expect(doorState(BEATS.fall[1])).toEqual({ handle: 0, open: 0 });
  });

  it('turns the handle before the door moves', () => {
    expect(DOOR_TIMING.handle[1]).toBeLessThanOrEqual(DOOR_TIMING.open[0]);
  });

  it('is fully open before the camera gets to it', () => {
    const [start, end] = BEATS.hallway;
    const openAt = start + DOOR_TIMING.open[1] * (end - start);
    expect(doorState(openAt).open).toBe(1);
    expect(cameraZAt(openAt)).toBeGreaterThan(0.5);
  });
});
