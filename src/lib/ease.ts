/** Ken Perlin's smootherstep: 0 at `edge0`, 1 at `edge1`, flat at both ends. */
export function smootherstep(value: number, edge0: number, edge1: number): number {
  if (edge1 <= edge0) return value >= edge1 ? 1 : 0;
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
