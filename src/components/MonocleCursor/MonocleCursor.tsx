import { useEffect, useId, useMemo, useRef } from 'react';
import monocleUrl from '@/assets/cursors/monocle.webp';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { lensMap } from './lensMap';
import styles from './MonocleCursor.module.css';

/** Measurements of monocle.webp in its own pixels: size, and the lens hole. */
const IMAGE = { width: 263, height: 251, lens: { x: 88.06, y: 89.15, radius: 42 } };
/** On-screen width of the monocle, in CSS px. */
const WIDTH = 76;
const SCALE = WIDTH / IMAGE.width;
const LENS_RADIUS = IMAGE.lens.radius * SCALE;
const MAP_SIZE = 64;

interface MonocleCursorProps {
  /** Shown and following the mouse while true. The parent hides the system cursor. */
  active: boolean;
}

/**
 * A monocle that stands in for the mouse, with the lens centred on the hot
 * spot. Its glass is see-through but warps what is behind it: an SVG
 * displacement filter applied as a backdrop filter. Browsers that cannot
 * filter the backdrop just show clear glass. Mouse only; touch has no cursor.
 */
export function MonocleCursor({ active }: MonocleCursorProps) {
  const finePointer = useMediaQuery('(pointer: fine)');
  if (!active || !finePointer) return null;
  return <Monocle />;
}

function Monocle() {
  const filterId = useId();
  const root = useRef<HTMLDivElement>(null);
  const map = useMemo(() => lensMapUrl(), []);
  const diameter = LENS_RADIUS * 2;

  useEffect(() => {
    let frame = 0;
    let x = 0;
    let y = 0;
    const place = () => {
      frame = 0;
      const element = root.current;
      if (!element) return;
      element.style.transform = `translate(${x - IMAGE.lens.x * SCALE}px, ${y - IMAGE.lens.y * SCALE}px)`;
      element.style.opacity = '1';
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const stage = root.current?.offsetParent?.getBoundingClientRect();
      x = event.clientX - (stage?.left ?? 0);
      y = event.clientY - (stage?.top ?? 0);
      if (!frame) frame = requestAnimationFrame(place);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div ref={root} className={styles.root} style={{ width: WIDTH }} aria-hidden="true">
      <svg className={styles.defs} width="0" height="0">
        <filter
          id={filterId}
          x="0"
          y="0"
          width={diameter}
          height={diameter}
          filterUnits="userSpaceOnUse"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={map}
            x="0"
            y="0"
            width={diameter}
            height={diameter}
            preserveAspectRatio="none"
            result="map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={LENS_RADIUS}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <div
        className={styles.lens}
        style={{
          left: IMAGE.lens.x * SCALE - LENS_RADIUS,
          top: IMAGE.lens.y * SCALE - LENS_RADIUS,
          width: diameter,
          height: diameter,
          backdropFilter: `url(#${filterId})`,
        }}
      />
      <img className={styles.frame} src={monocleUrl} alt="" draggable={false} />
    </div>
  );
}

/** The lens displacement map as a PNG data URL, drawn once. */
function lensMapUrl(): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = MAP_SIZE;
  const context = canvas.getContext('2d');
  if (!context) return '';
  const pixels = lensMap(MAP_SIZE, { bulge: 0.45, swirl: 0.12 });
  context.putImageData(new ImageData(new Uint8ClampedArray(pixels), MAP_SIZE, MAP_SIZE), 0, 0);
  return canvas.toDataURL('image/png');
}
