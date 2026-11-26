/**
 * The gallery as ranges of its own scroll progress (0 = the stats sheet in
 * place under "experience", 1 = facing the exit). Holds keep the camera
 * still so there is time to look. Tune timing here; the camera path and the
 * hand-off read this table.
 */
export const BEATS = {
  /** The plaster behind the word fades to black. */
  darken: [0, 0.07],
  /** The stats sheet's right side drops; it swings from its top-left corner. */
  swing: [0.02, 0.09],
  /** It hangs there for a moment. */
  dangle: [0.09, 0.12],
  /** Then it lets go and falls out of sight. */
  fall: [0.12, 0.18],
  /** Hold on "experience" alone in the dark. */
  linger: [0.18, 0.21],
  /** Walk down the black hallway, past the hanging word. */
  hallway: [0.21, 0.36],
  /** Glide into the one spot where everything lines up. */
  arrive: [0.36, 0.44],
  /** Hold: "projects" and a doorway, read as one flat drawing over the stairs. */
  illusion: [0.44, 0.5],
  /** Step sideways and down; the drawing falls apart in depth. */
  break: [0.5, 0.6],
  /** Down the stairs into the room. */
  descend: [0.6, 0.7],
  /** Visit each project in turn, then face the exit. */
  room: [0.7, 1],
} as const satisfies Record<string, readonly [number, number]>;

/** Within each room stop, the share spent moving (the rest is a hold). */
export const ROOM_MOVE_SHARE = 0.55;
