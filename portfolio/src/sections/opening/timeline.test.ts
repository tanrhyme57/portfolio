import { describe, expect, it } from 'vitest';
import { timelineVars } from './timeline';

describe('timelineVars', () => {
  it('starts with everything closed', () => {
    const vars = timelineVars(0);
    expect(vars['--fold']).toBe('0.0000');
    expect(vars['--stats']).toBe('0.0000');
  });

  it('ends with everything open', () => {
    const vars = timelineVars(1);
    for (const value of Object.values(vars)) expect(value).toBe('1.0000');
  });
});
