/**
 * How far a tall element has been scrolled through while its sticky child
 * fills the screen: 0 when its top reaches the top of the viewport, 1 when
 * its bottom reaches the bottom.
 */
export function scrollProgress(top: number, height: number, viewportHeight: number): number {
  const distance = height - viewportHeight;
  if (distance <= 0) return top <= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, -top / distance));
}

/** 0..1 position of `value` inside `[start, end]`, clamped. */
export function phase(value: number, [start, end]: readonly [number, number]): number {
  if (end <= start) return value >= end ? 1 : 0;
  return Math.min(1, Math.max(0, (value - start) / (end - start)));
}
