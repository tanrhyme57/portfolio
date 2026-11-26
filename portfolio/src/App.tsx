import { SectionNav } from '@/components/SectionNav';
import { projects } from '@/config/projects';
import { sections } from '@/config/sections';
import { OpeningSequence } from '@/sections/opening';
import { PlaceholderSection } from '@/sections/placeholder';
import { ProjectList } from '@/sections/projects';

/** Sections that live inside the opening sequence's scroll track rather than as their own screen. */
const IN_TRACK = new Set<string>(['home', 'stats', 'projects']);
const PROJECT_LIST_ID = 'project-list';

export function App() {
  return (
    <>
      <SectionNav items={sections} />
      <main>
        <OpeningSequence projectListId={PROJECT_LIST_ID} />
        <ProjectList id={PROJECT_LIST_ID} projects={projects} />
        {sections
          .filter((section) => !IN_TRACK.has(section.id))
          .map((section) => (
            <PlaceholderSection key={section.id} id={section.id} title={section.label} />
          ))}
      </main>
    </>
  );
}
