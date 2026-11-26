import { Euler, MathUtils, Quaternion, Vector3 } from 'three';
import { LAYOUT, ROOM_BACK_Z, ROOM_FLOOR_Y } from './dimensions';

/** Poses and positions derived from the greybox dimensions (see dimensions.ts). */
export * from './dimensions';

/** The eye point, and the way it faces, as a camera would. */
export function eyePose() {
  const position = new Vector3(...LAYOUT.eye.position);
  const quaternion = new Quaternion().setFromEuler(
    new Euler(MathUtils.degToRad(LAYOUT.eye.pitchDeg), 0, 0),
  );
  return {
    position,
    quaternion,
    forward: new Vector3(0, 0, -1).applyQuaternion(quaternion),
    right: new Vector3(1, 0, 0).applyQuaternion(quaternion),
    up: new Vector3(0, 1, 0).applyQuaternion(quaternion),
  };
}

export interface Slot {
  /** Centre of the project image. */
  centre: Vector3;
  /** Unit vector out of the wall, into the room. */
  normal: Vector3;
  /** Rotation about y that turns a plane facing +z to face along `normal`. */
  yaw: number;
}

function slot(x: number, z: number, normal: Vector3): Slot {
  return {
    centre: new Vector3(x, ROOM_FLOOR_Y + LAYOUT.slots.centreHeight, z),
    normal,
    yaw: Math.atan2(normal.x, normal.z),
  };
}

/** The six project walls, in the order the camera visits them. */
export function projectSlots(): Slot[] {
  const half = LAYOUT.room.width / 2;
  const near = LAYOUT.room.frontZ - 2;
  const far = ROOM_BACK_Z + 2;
  const right = new Vector3(1, 0, 0);
  const left = new Vector3(-1, 0, 0);
  const forward = new Vector3(0, 0, 1);
  return [
    slot(-half, near, right),
    slot(-half, far, right),
    slot(-2.2, ROOM_BACK_Z, forward),
    slot(2.2, ROOM_BACK_Z, forward),
    slot(half, far, left),
    slot(half, near, left),
  ];
}

/** Centre of the exit doorway in the back wall. */
export function exitCentre(): Vector3 {
  return new Vector3(0, ROOM_FLOOR_Y + LAYOUT.exit.height / 2, ROOM_BACK_Z);
}
