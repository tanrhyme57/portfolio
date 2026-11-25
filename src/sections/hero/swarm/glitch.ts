import type { SwarmConfig } from './config';
import type { Random } from './simulation';

/**
 * A glitch burst tears a horizontal band of the swarm sideways for a moment,
 * like a bad scanline.
 */
export interface GlitchState {
  /** When the next burst starts. */
  nextAt: number;
  /** When the current burst ends (in the past when idle). */
  until: number;
  bandCenter: number;
  bandHalfHeight: number;
  /** Sideways offset, world units. */
  shift: number;
}

export function createGlitchState(firstAt: number): GlitchState {
  return { nextAt: firstAt, until: -1, bandCenter: 0, bandHalfHeight: 0, shift: 0 };
}

export function updateGlitch(
  glitch: GlitchState,
  time: number,
  config: SwarmConfig['glitch'],
  worldHeight: number,
  botSize: number,
  random: Random = Math.random,
): void {
  if (time < glitch.nextAt) return;
  const [min, max] = config.interval;
  glitch.until = time + config.duration * (0.6 + random() * 0.8);
  glitch.nextAt = time + min + random() * (max - min);
  glitch.bandCenter = (random() - 0.5) * worldHeight;
  glitch.bandHalfHeight = (config.bandHeight * worldHeight * (0.5 + random())) / 2;
  glitch.shift = (random() < 0.5 ? -1 : 1) * config.shift * botSize * (0.5 + random());
}

/** Sideways offset for something drawn at height `y`; 0 outside a burst. */
export function glitchShift(glitch: GlitchState, y: number, time: number): number {
  if (time > glitch.until) return 0;
  return Math.abs(y - glitch.bandCenter) < glitch.bandHalfHeight ? glitch.shift : 0;
}
