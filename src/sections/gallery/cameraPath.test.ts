import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { BEATS } from './beats';
import { buildCameraPath, sampleCamera } from './cameraPath';
import { cameraZAt, sheetFall, wordView } from './handoff';
import { eyePose, LAYOUT } from './layout';

const keys = buildCameraPath();
const pose = () => ({ position: new Vector3(), target: new Vector3() });

describe('buildCameraPath', () => {
  it('has keys in order from 0 to 1', () => {
    expect(keys[0]!.at).toBe(0);
    expect(keys[keys.length - 1]!.at).toBeCloseTo(1);
    for (let i = 1; i < keys.length; i++) expect(keys[i]!.at).toBeGreaterThan(keys[i - 1]!.at);
  });

  it('stays still at the hallway start until the paper has fallen', () => {
    for (const at of [0, BEATS.fall[1], BEATS.hallway[0]]) {
      const out = pose();
      sampleCamera(keys, at, out);
      expect(out.position.z).toBeCloseTo(LAYOUT.hallway.startZ);
    }
  });

  it('holds still on the eye point during the illusion', () => {
    const eye = eyePose().position;
    for (const at of [BEATS.illusion[0], 0.49, BEATS.illusion[1]]) {
      const out = pose();
      sampleCamera(keys, at, out);
      expect(out.position.distanceTo(eye)).toBeLessThan(1e-9);
    }
  });

  it('walks straight down the hallway, matching the hand-off maths', () => {
    for (let at = 0; at <= BEATS.hallway[1]; at += 0.01) {
      const out = pose();
      sampleCamera(keys, at, out);
      expect(out.position.x).toBe(0);
      expect(out.target.y).toBe(out.position.y);
      expect(cameraZAt(at)).toBeCloseTo(out.position.z);
    }
  });
});

describe('hand-off', () => {
  it('swings the sheet, lets it hang, then drops it off screen', () => {
    expect(sheetFall(0)).toEqual({ angle: 0, drop: 0 });
    const hanging = sheetFall(BEATS.dangle[0]);
    expect(hanging.angle).toBeGreaterThan(60);
    expect(hanging.drop).toBe(0);
    expect(sheetFall(BEATS.fall[1]).drop).toBeGreaterThan(1);
  });

  it('pins the word to its plane and fades it before the camera reaches it', () => {
    const start = wordView(LAYOUT.hallway.startZ, 900, 0);
    expect(start.translateZ).toBe(0);
    expect(start.translateY).toBe(0);
    expect(start.opacity).toBe(1);
    const close = wordView(LAYOUT.hallway.wordZ + 0.1, 900, BEATS.hallway[1]);
    expect(close.opacity).toBe(0);
    expect(close.translateZ).toBeLessThan(close.perspective);
  });
});
