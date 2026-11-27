import { useId, useImperativeHandle, useMemo, useRef, type Ref } from 'react';
import handUrl from '@/assets/textures/gallery/wipe-hand.webp';
import type { Size } from '@/lib/coverFit';
import { PAPER } from '../paper';
import { HAND, pathData, planWipe, wipeAt } from './wipe';
import styles from './WipeBackdrop.module.css';

export interface WipeBackdropHandle {
  /** Wipe progress, 0..1: the hand comes in, wipes, and pulls back out. */
  update(progress: number): void;
}

interface WipeBackdropProps {
  ref: Ref<WipeBackdropHandle>;
  /** Size of the stage, in pixels. */
  size: Size;
}

/**
 * The dark plaster behind everything, which a hand with a cloth later wipes
 * away to black. The plaster is drawn as an SVG image under a mask; the
 * cloth's path is a thick stroke in that mask, revealed with a dash offset,
 * so wiping and un-wiping (scrolling back) cost one attribute each.
 */
export function WipeBackdrop({ ref, size }: WipeBackdropProps) {
  const maskId = useId();
  const track = useRef<SVGPathElement>(null);
  const hand = useRef<HTMLImageElement>(null);
  const { width, height } = size;
  const plan = useMemo(() => (width && height ? planWipe(width, height) : null), [width, height]);

  useImperativeHandle(
    ref,
    () => ({
      update(progress) {
        if (!plan) return;
        const at = wipeAt(plan, progress);
        track.current?.setAttribute('stroke-dashoffset', String(plan.total - at.wiped));
        const image = hand.current;
        if (!image) return;
        const showing = progress > 0 && progress < 1;
        image.style.visibility = showing ? 'visible' : 'hidden';
        if (!showing) return;
        const ox = HAND.cloth.x * plan.handWidth;
        const oy = (HAND.cloth.y * plan.handWidth) / HAND.aspect;
        image.style.transform = `translate(${at.x - ox}px, ${at.y - oy}px) rotate(${at.rotation}deg)`;
      },
    }),
    [plan],
  );

  return (
    <div className={styles.root} aria-hidden="true">
      {plan && (
        <svg
          className={styles.fill}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
              <rect width={width} height={height} fill="white" />
              <path
                ref={track}
                d={pathData(plan)}
                fill="none"
                stroke="black"
                strokeWidth={plan.stroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                // One dash the length of the path, then a gap longer than it, so no
                // second dash (and its round cap) ever shows at the path's end.
                strokeDasharray={`${plan.total} ${plan.total * 2}`}
                strokeDashoffset={plan.total}
              />
            </mask>
          </defs>
          {/* Same cover fit as the artboard: centred, cropped to fill. */}
          <image
            href={PAPER.backdrop}
            width={width}
            height={height}
            preserveAspectRatio="xMidYMid slice"
            mask={`url(#${maskId})`}
          />
        </svg>
      )}
      {plan && (
        <img
          ref={hand}
          className={styles.hand}
          src={handUrl}
          alt=""
          decoding="async"
          style={{
            width: plan.handWidth,
            transformOrigin: `${HAND.cloth.x * 100}% ${HAND.cloth.y * 100}%`,
          }}
        />
      )}
    </div>
  );
}
