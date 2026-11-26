import { phase } from '@/lib/scrollProgress';

/**
 * The opening, as ranges of its own scroll progress (0 = top of the page,
 * 1 = stats sheet fully shown). Tweak timing here; the CSS only reads the
 * resulting variables. How the opening shares the scroll track with the
 * gallery that follows is in track.ts.
 */
export const TIMELINE = {
  /** How far you scroll through the opening, in screen heights. */
  scroll: 3.2,
  /** The name slides off to the left and the scroll cue fades. */
  heroOut: [0, 0.1],
  /** The bots pull back up through the top edge, taking the orb with them. */
  swarmUp: [0, 0.14],
  /**
   * The paper folds square by square into the word while the rest of the
   * halves slide off to the sides (details in fold/choreography.ts).
   */
  fold: [0.04, 0.78],
  /** The stats sheet slides up and unfolds. */
  stats: [0.72, 0.9],
  /** Where the "Stats" link in the side nav jumps to (fully revealed). */
  statsAnchor: 0.93,
} as const satisfies Record<string, unknown>;

type Range = readonly [number, number];
const RANGES = [
  'heroOut',
  'swarmUp',
  'fold',
  'stats',
] as const satisfies readonly (keyof typeof TIMELINE)[];

/** CSS variables (each 0..1) for every phase at the given scroll progress. */
export function timelineVars(progress: number): Record<string, string> {
  const vars: Record<string, string> = { '--progress': progress.toFixed(4) };
  for (const name of RANGES) {
    vars[`--${name}`] = phase(progress, TIMELINE[name] as Range).toFixed(4);
  }
  return vars;
}

/** The bots stop rendering once they have faded out. */
export const SWARM_HIDDEN_AT = TIMELINE.swarmUp[1];
