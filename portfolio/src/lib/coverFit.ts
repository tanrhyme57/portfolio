export interface Size {
  width: number;
  height: number;
}

/**
 * Where a vertical line sitting at fraction `u` (0..1) of an image's width
 * ends up inside a container that draws the image with
 * `background-size: cover; background-position: center`.
 *
 * Returns the distance in px from the container's left edge.
 */
export function coverLineX(container: Size, image: Size, u: number): number {
  const scale = Math.max(container.width / image.width, container.height / image.height);
  const drawnWidth = image.width * scale;
  const offsetX = (container.width - drawnWidth) / 2;
  return offsetX + u * drawnWidth;
}
