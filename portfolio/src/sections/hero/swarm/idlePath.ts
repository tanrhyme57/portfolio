/**
 * Where the column wanders when nobody is pointing: a slow, never-quite-
 * repeating loop. Returns normalised coordinates (-1..1, y up).
 */
export function idleTarget(time: number): { x: number; y: number } {
  return {
    x: 0.42 * Math.sin(time * 0.21) + 0.12 * Math.sin(time * 0.67 + 1.3),
    y: -0.12 + 0.22 * Math.sin(time * 0.33 + 0.8) + 0.06 * Math.sin(time * 0.9),
  };
}
