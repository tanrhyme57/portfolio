import { phase } from '@/lib/scrollProgress';

/**
 * The whole opening, as ranges of scroll progress (0 = top of the page,
 * 1 = end of the sequence). Tweak timing here; the CSS only reads the
 * resulting variables.
 */
export const TIMELINE = {
  /** Scroll length of the sequence, in screen heights (including the first screen). */
  length: 3.2,
  /** Name, scroll cue and bots fade away. */
  heroOut: [0, 0.12],
  /** The two halves swing open and fold up. */
  doors: [0.04, 0.45],
  /** "experience" folds up letter by letter. */
  word: [0.3, 0.6],
  /** The stats sheet slides up and unfolds. */
  stats: [0.55, 0.82],
  /** Where the "Stats" link in the side nav jumps to (fully revealed). */
  statsAnchor: 0.85,
} as const satisfies Record<string, unknown>;

type Range = readonly [number, number];
const RANGES = [
  'heroOut',
  'doors',
  'word',
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

/**
 * Where to put a scroll target so that jumping to it (its top at the top of
 * the screen) lands at `progress`, as a share of the track's height.
 */
export function anchorOffset(progress: number): number {
  return (progress * (TIMELINE.length - 1)) / TIMELINE.length;
}

/** The bots stop rendering once they have faded out. */
export const SWARM_HIDDEN_AT = TIMELINE.heroOut[1];
