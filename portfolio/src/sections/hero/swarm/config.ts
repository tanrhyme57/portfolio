/**
 * Every tunable number of the swarm lives here.
 *
 * Units: sizes are in "bot lengths" (the bot model is normalised to length 1
 * and then scaled by `botSize`), speeds are in viewport heights per second,
 * times are in seconds. That keeps the look the same on any screen.
 */
export interface SwarmConfig {
  /** Number of bots. */
  count: number;
  /** Bot length as a fraction of the visible height. */
  botSize: number;

  column: {
    /** Vertical distance between rings, in bot lengths. */
    rowSpacing: number;
    /** Distance between neighbours on a ring, in bot lengths. */
    ringSpacing: number;
    /** Radius of the ring holding the orb, in bot lengths. */
    topRadius: number;
    /** How fast the column widens towards the edge it grows from. */
    flare: number;
    flarePower: number;
    /** Fewest bots on a ring. */
    minRing: number;
    /** How far each ring is rotated relative to the one above (radians). */
    twist: number;
    /** Ring rotation speed (radians per second); alternates direction per ring. */
    spin: number;
    /** Share of bots always kept in the mass along the edge. */
    minPoolShare: number;
  };

  pool: {
    /** How far the mass reaches either side of the column's root, in bot lengths. */
    spread: number;
    /** How fast the bots in the mass crawl back and forth. */
    spin: number;
    /** Thickness of the mass at the column's root, in bot lengths. */
    mound: number;
    /** Thickness of the mass at the screen's sides, in bot lengths. */
    edge: number;
    /** Depth of the mass relative to the column's root. */
    depthScale: number;
  };

  /** Squashes depth so the 3D column reads clearly from the front. */
  depthScale: number;

  /** The "alive" part: everything that keeps the structure from looking rigid. */
  motion: {
    /** How much a ring swells as the bulge passes (0.3 = 30% wider). */
    pulse: number;
    /** Bulges per bot length along the column. */
    pulseFrequency: number;
    pulseSpeed: number;
    /** Sideways swing of the column's middle, as a share of its length. */
    sway: number;
    swaySpeed: number;
    /** Each bot wanders around its spot, in bot lengths. */
    jitter: number;
    jitterSpeed: number;
    /** Chance per bot per second of a sudden twitch out of place. */
    twitchRate: number;
    /** Strength of a twitch, in viewport heights per second. */
    twitchStrength: number;
  };

  spring: {
    /** Stiffness for bots right under the cursor... */
    stiffnessTop: number;
    /** ...and for bots at the bottom / in the pile, so the column sways. */
    stiffnessBottom: number;
    /** 1 = critically damped. Lower is bouncier. */
    dampingRatio: number;
    /** Speed cap: on fast flicks the swarm lags and catches up. */
    maxSpeed: number;
  };

  entry: {
    /** Wait before the first bot drops. */
    delay: number;
    /** Time between the first and last bot starting to drop. */
    stagger: number;
    /** Random extra delay per bot. */
    jitter: number;
    /** How long a bot moves in stop-motion steps after it starts dropping. */
    stutterDuration: number;
    /** During that time its drawn position only updates every N frames. */
    stutterFrames: number;
  };

  glitch: {
    /** Seconds between glitch bursts (random in this range). */
    interval: [min: number, max: number];
    /** Length of a burst. */
    duration: number;
    /** Height of the glitched band, as a fraction of the visible height. */
    bandHeight: number;
    /** Sideways tear of the band, in bot lengths. */
    shift: number;
    /** Chance per bot per frame of a one-frame colour flicker. */
    flickerChance: number;
  };

  /** The glowing orb that replaces the cursor and rests on the column. */
  orb: {
    /** Radius in CSS px. */
    radiusPx: number;
    /** How quickly it settles back onto the column when nobody holds it (1/s). */
    settle: number;
  };

  /**
   * Where the orb sits relative to the pointer, in CSS px (x right, y down).
   * On touch it floats above the finger so the finger does not hide it.
   */
  pointerOffset: { mouse: [number, number]; touch: [number, number] };

  /** Seconds without input before the swarm wanders on its own. */
  idleDelay: { mouse: number; touch: number };

  /** How quickly the column top chases its target (1/s). */
  follow: { pointer: number; idle: number };
}

export const desktopSwarm: SwarmConfig = {
  count: 1800,
  botSize: 0.04,
  column: {
    rowSpacing: 0.2,
    ringSpacing: 0.55,
    topRadius: 0.45,
    flare: 0.07,
    flarePower: 1.25,
    minRing: 3,
    twist: 0.62,
    spin: 0.35,
    minPoolShare: 0.3,
  },
  pool: { spread: 28, spin: 0.9, mound: 6, edge: 2.2, depthScale: 0.35 },
  depthScale: 0.8,
  motion: {
    pulse: 0.28,
    pulseFrequency: 0.45,
    pulseSpeed: 3.2,
    sway: 0.06,
    swaySpeed: 0.9,
    jitter: 0.22,
    jitterSpeed: 1.6,
    twitchRate: 0.12,
    twitchStrength: 1.4,
  },
  spring: {
    stiffnessTop: 260,
    stiffnessBottom: 45,
    dampingRatio: 0.72,
    maxSpeed: 2.6,
  },
  entry: {
    delay: 0.35,
    stagger: 1.6,
    jitter: 0.45,
    stutterDuration: 1.1,
    stutterFrames: 4,
  },
  glitch: {
    interval: [1.6, 4.5],
    duration: 0.14,
    bandHeight: 0.06,
    shift: 1.4,
    flickerChance: 0.0006,
  },
  orb: { radiusPx: 11, settle: 8 },
  pointerOffset: { mouse: [0, 0], touch: [0, -70] },
  idleDelay: { mouse: 2.5, touch: 1.2 },
  follow: { pointer: 22, idle: 2.2 },
};

/** Phones and tablets: fewer, bigger bots. */
export const touchSwarm: SwarmConfig = {
  ...desktopSwarm,
  count: 950,
  botSize: 0.05,
  pool: { ...desktopSwarm.pool, spread: 12 },
  orb: { ...desktopSwarm.orb, radiusPx: 14 },
};
