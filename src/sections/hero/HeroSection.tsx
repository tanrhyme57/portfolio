import { Suspense, useRef, type CSSProperties } from 'react';
import { Section } from '@/components/Section';
import { HeroText } from './HeroText';
import { PaperBackground, useFoldLine } from './PaperBackground';
import { ScrollCue } from './ScrollCue';
import { SwarmCanvas } from './swarm';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  /** Section the scroll cue leads to. */
  nextId: string;
}

/**
 * Landing screen, stacked back to front:
 * paper background → name → bot swarm → scroll cue.
 */
export function HeroSection({ nextId }: HeroSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const seamX = useFoldLine(ref);

  return (
    <Section
      ref={ref}
      id="home"
      palette="hero"
      className={styles.hero}
      style={{ '--seam-x': seamX } as CSSProperties}
    >
      <PaperBackground />
      <HeroText />
      <Suspense fallback={null}>
        <SwarmCanvas sectionRef={ref} />
      </Suspense>
      <ScrollCue targetId={nextId} />
    </Section>
  );
}
