import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
  type Ref,
} from 'react';
import { PAPER } from '../paper';
import { mirrored, planFold, poseAt, type FoldPlan } from './choreography';
import { buildTiles, GRID } from './tileGrid';
import type { CellShape } from './types';
import styles from './FoldingPaper.module.css';

export interface FoldingPaperHandle {
  /** Move every square to where it is at this point of the fold phase (0..1). */
  update(progress: number): void;
}

interface FoldingPaperProps {
  ref: Ref<FoldingPaperHandle>;
  word: string;
}

const CLIP: Record<CellShape, string> = {
  full: 'none',
  tl: 'polygon(0 0, 100% 0, 0 100%)',
  tr: 'polygon(0 0, 100% 0, 100% 100%)',
  bl: 'polygon(0 0, 100% 100%, 0 100%)',
  br: 'polygon(100% 0, 100% 100%, 0 100%)',
};

/**
 * The two paper halves, cut into their printed squares. The squares fold
 * off the halves and assemble into `word`; the rest of the paper slides away.
 * Positions come from `choreography.ts`; this component only writes them to
 * the DOM, once per scroll frame, without re-rendering.
 */
export function FoldingPaper({ ref, word }: FoldingPaperProps) {
  const tiles = useMemo(() => buildTiles(), []);
  const root = useRef<HTMLDivElement>(null);
  const elements = useRef<(HTMLDivElement | null)[]>([]);
  const plan = useRef<FoldPlan | null>(null);
  const progress = useRef(0);

  const render = () => {
    const current = plan.current;
    if (!current) return;
    tiles.forEach((_, index) => {
      const element = elements.current[index];
      if (!element) return;
      const pose = poseAt(current, index, progress.current);
      // A hair larger than the grid so no hairline gaps show between squares.
      element.style.width = element.style.height = `${pose.size + 0.75}px`;
      element.style.transformOrigin = `${pose.originX}px 50%`;
      element.style.transform =
        `translate3d(${pose.x}px, ${pose.y}px, 0) rotateZ(${pose.rotateZ}deg) ` +
        `rotateY(${pose.rotateY}deg) rotateX(${pose.rotateX}deg) scale(${pose.scale})`;
      // The back shows once flipped, so it gets the shape as is; the front is mirrored.
      element.style.setProperty('--clip-back', CLIP[pose.shape ?? 'full']);
      element.style.setProperty('--clip-front', CLIP[mirrored(pose.shape ?? 'full')]);
    });
  };

  useImperativeHandle(ref, () => ({
    update(next) {
      progress.current = next;
      render();
    },
  }));

  // Re-plan when the screen changes shape (the word wraps on portrait screens).
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      plan.current = planFold(tiles, word, { width, height });
      element.style.setProperty(
        '--k',
        String(width / height > 16 / 9 ? width / 3840 : height / 2160),
      );
      render();
    });
    observer.observe(element);
    return () => observer.disconnect();
    // render reads refs only; re-subscribing on every render is not needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, word]);

  return (
    <div ref={root} className={styles.root} aria-hidden="true">
      {tiles.map((tile, index) => {
        const door = tile.side < 0 ? PAPER.left : PAPER.right;
        const style = {
          '--door': `url(${tile.side < 0 ? PAPER.left.url : PAPER.right.url})`,
          '--door-w': door.width * 3840,
          '--src-x': tile.x - door.x * 3840,
          '--src-y': tile.y,
          '--pitch': GRID.pitch,
          '--light': `url(${PAPER.light})`,
          '--light-x': `${(index * 37) % 100}%`,
          '--light-y': `${(index * 61) % 100}%`,
        } as CSSProperties;
        return (
          <div
            key={index}
            ref={(element) => {
              elements.current[index] = element;
            }}
            className={styles.tile}
            style={style}
          >
            <div className={styles.front} />
            <div className={styles.back} />
          </div>
        );
      })}
    </div>
  );
}
