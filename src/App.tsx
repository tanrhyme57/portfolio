import { SectionNav } from '@/components/SectionNav';
import { sections } from '@/config/sections';
import { OpeningSequence } from '@/sections/opening';
import { PlaceholderSection } from '@/sections/placeholder';

/** Sections that live inside the opening sequence rather than as their own screen. */
const IN_OPENING = new Set<string>(['home', 'stats']);

export function App() {
  return (
    <>
      <SectionNav items={sections} />
      <main>
        <OpeningSequence />
        {sections
          .filter((section) => !IN_OPENING.has(section.id))
          .map((section) => (
            <PlaceholderSection key={section.id} id={section.id} title={section.label} />
          ))}
      </main>
    </>
  );
}
