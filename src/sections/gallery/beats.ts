/**
 * The gallery as ranges of its own scroll progress (0 = the stats sheet in
 * place under "experience", 1 = facing the exit). Holds keep the camera
 * still so there is time to look. Tune timing here; the camera path and the
 * hand-off read this table.
 */
export const BEATS = {
  /** A hand with a cloth wipes the plaster off the screen, leaving black. */
  wipe: [0, 0.11],
  /** The stats sheet's right side drops; it swings from its top-left corner. */
  swing: [0.1, 0.16],
  /** It hangs there for a moment. */
  dangle: [0.16, 0.19],
  /** Then it lets go and falls out of sight. */
  fall: [0.19, 0.24],
  /** Hold on "experience" alone in the dark. */
  linger: [0.24, 0.27],
  /** Walk down the black hallway, past the hanging word, through the door. */
  hallway: [0.27, 0.4],
  /** Glide into the one spot where everything lines up. */
  arrive: [0.4, 0.46],
  /** Hold: "projects" and a doorway, read as one flat drawing over the stairs. */
  illusion: [0.46, 0.52],
  /** Step sideways and down; the drawing falls apart in depth. */
  break: [0.52, 0.61],
  /** Down the stairs into the room. */
  descend: [0.61, 0.7],
  /** Visit each project in turn, then face the exit. */
  room: [0.7, 1],
} as const satisfies Record<string, readonly [number, number]>;

/** Within each room stop, the share spent moving (the rest is a hold). */
export const ROOM_MOVE_SHARE = 0.55;
