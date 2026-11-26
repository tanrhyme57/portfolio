import { Vector3 } from 'three';
import { smootherstep } from '@/lib/ease';
import { BEATS, ROOM_MOVE_SHARE } from './beats';
import { HALLWAY_KEYS } from './handoff';
import {
  exitCentre,
  eyePose,
  LAYOUT,
  projectSlots,
  ROOM_BACK_Z,
  ROOM_FLOOR_Y,
  STAIRS_BOTTOM_Z,
} from './layout';

/** Where the camera is and what it looks at, at one moment of the scroll. */
export interface CameraKey {
  at: number;
  position: Vector3;
  target: Vector3;
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

/**
 * The camera's walk through the gallery as keyframes on gallery progress.
 * A hold is two keys with the same pose. Down the hallway the camera looks
 * straight ahead, which lets the HTML word stay pinned to its plane with
 * plain CSS perspective (see handoff.ts).
 */
export function buildCameraPath(portrait = false): CameraKey[] {
  const eyeLevel = ROOM_FLOOR_Y + LAYOUT.eyeHeight;
  const straight = v(0, LAYOUT.eyeHeight, -20);
  const eye = eyePose();

  const keys: CameraKey[] = [];
  const key = (at: number, position: Vector3, target: Vector3) =>
    keys.push({ at, position, target });

  // Still while the paper falls, then straight down the hallway (handoff.ts).
  key(0, v(0, LAYOUT.eyeHeight, LAYOUT.hallway.startZ), straight);
  for (const { at, z } of HALLWAY_KEYS) key(at, v(0, LAYOUT.eyeHeight, z), straight);
  const eyeTarget = eye.position.clone().addScaledVector(eye.forward, 4);
  key(BEATS.arrive[1], eye.position, eyeTarget);
  key(BEATS.illusion[1], eye.position, eyeTarget);
  key(BEATS.break[1], v(1.9, 0.9, -2.2), v(0, -0.8, STAIRS_BOTTOM_Z - 0.3));
  key(BEATS.descend[1], v(0, eyeLevel, STAIRS_BOTTOM_Z - 0.6), v(0, eyeLevel - 0.2, ROOM_BACK_Z));

  // The room: a move then a hold in front of each project, then the exit.
  const stops = projectSlots().map((slot) => ({
    position: slot.centre
      .clone()
      .addScaledVector(slot.normal, LAYOUT.slots.standOff[portrait ? 'portrait' : 'landscape'])
      .setY(eyeLevel),
    target: slot.centre,
  }));
  const exit = exitCentre();
  stops.push({ position: v(0, eyeLevel, exit.z + LAYOUT.exit.standOff), target: exit });

  const [roomStart, roomEnd] = BEATS.room;
  const share = (roomEnd - roomStart) / stops.length;
  stops.forEach((stop, i) => {
    const start = roomStart + i * share;
    key(start + share * ROOM_MOVE_SHARE, stop.position, stop.target);
    key(start + share, stop.position, stop.target);
  });
  return keys;
}

/** Writes the camera pose at gallery `progress` into `out`, easing between keys. */
export function sampleCamera(
  keys: readonly CameraKey[],
  progress: number,
  out: { position: Vector3; target: Vector3 },
): void {
  const first = keys[0]!;
  const last = keys[keys.length - 1]!;
  if (progress <= first.at) return void copyKey(first, out);
  if (progress >= last.at) return void copyKey(last, out);

  let i = 1;
  while (keys[i]!.at < progress) i++;
  const from = keys[i - 1]!;
  const to = keys[i]!;
  const t = smootherstep(progress, from.at, to.at);
  out.position.lerpVectors(from.position, to.position, t);
  out.target.lerpVectors(from.target, to.target, t);
}

function copyKey(key: CameraKey, out: { position: Vector3; target: Vector3 }) {
  out.position.copy(key.position);
  out.target.copy(key.target);
}
