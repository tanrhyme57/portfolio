/**
 * Greybox of the hallway and illusion room, in metres (y up). Everything the
 * scene and the camera path need is derived from these numbers, so the
 * blockout is tuned here. A modelled gallery.glb replaces the boxes later,
 * keeping the same layout.
 *
 * The camera starts at the far end of a black hallway (z > 0) and walks
 * towards -z, past the word "experience" hanging in the dark. The hallway
 * opens at z = 0 onto a landing, the stairs down, and the room below.
 */
export const LAYOUT = {
  /** Vertical field of view of the site camera, in degrees. */
  fov: 40,
  hallway: {
    /** Where the camera starts. */
    startZ: 7,
    /** Where the word "experience" hangs (the HTML word is pinned to this plane). */
    wordZ: 3.5,
    /** Where the walk down the hallway ends, just before the landing. */
    endZ: 0.4,
    width: 5,
    height: 3.6,
    /** Doorway in the hallway's end wall (z = 0), onto the landing. */
    door: { width: 1.6, height: 2.6 },
    /** How far down the screen the word drifts while the paper falls, so it hangs nearer eye level. */
    wordDrift: 0.2,
  },
  /** Where everything lines up into one flat drawing. */
  eye: { position: [0, 1.6, -0.8] as const, pitchDeg: -35 },
  landing: { width: 1.6, depth: 1.6 },
  stairs: { width: 1.2, steps: 14, drop: 2.5, run: 3.5 },
  room: { width: 8, depth: 6.8, height: 3.6, frontZ: -4.6 },
  slots: {
    frame: { width: 1.2, height: 0.8, depth: 0.05 },
    image: { width: 1.0, height: 0.625 },
    centreHeight: 1.55,
    /** How far in front of a project the camera stops (portrait screens show less width). */
    standOff: { landscape: 2.1, portrait: 3.1 },
  },
  exit: { width: 1.1, height: 2.2, standOff: 4 },
  eyeHeight: 1.6,
} as const;

export const ROOM_FLOOR_Y = -LAYOUT.stairs.drop;
export const ROOM_BACK_Z = LAYOUT.room.frontZ - LAYOUT.room.depth;
export const STAIRS_TOP_Z = -LAYOUT.landing.depth;
export const STAIRS_BOTTOM_Z = STAIRS_TOP_Z - LAYOUT.stairs.run;
