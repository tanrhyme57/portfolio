/**
 * Displacement map for the monocle's lens, for an SVG feDisplacementMap.
 * Red and green hold the x and y offset (128 = none). Inside the lens,
 * pixels are pulled in towards the centre (a magnifying bulge) with a little
 * swirl near the rim; outside it nothing moves.
 */
export interface LensOptions {
  /** How much the centre is magnified, 0..1. */
  bulge: number;
  /** Twist near the rim, as a share of the radius. */
  swirl: number;
}

/**
 * RGBA pixels of a `size`×`size` map. Offsets are written for a
 * feDisplacementMap whose `scale` equals the lens radius in pixels.
 */
export function lensMap(size: number, { bulge, swirl }: LensOptions): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(size * size * 4);
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const u = ((i + 0.5) / size) * 2 - 1;
      const v = ((j + 0.5) / size) * 2 - 1;
      const r = Math.hypot(u, v);
      let dx = 0;
      let dy = 0;
      if (r < 1) {
        const pull = bulge * (1 - r * r);
        const twist = swirl * 4 * r * (1 - r);
        dx = -u * pull - v * twist;
        dy = -v * pull + u * twist;
      }
      const k = (j * size + i) * 4;
      // Displacement is scale × (channel − 0.5), with scale = radius: offsets in radii.
      pixels[k] = Math.round((0.5 + dx) * 255);
      pixels[k + 1] = Math.round((0.5 + dy) * 255);
      pixels[k + 2] = 128;
      pixels[k + 3] = 255;
    }
  }
  return pixels;
}
