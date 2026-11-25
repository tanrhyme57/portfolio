import { SectionNav } from '@/components/SectionNav';
import { sections } from '@/config/sections';
import { HeroSection } from '@/sections/hero';
import { PlaceholderSection } from '@/sections/placeholder';

export function App() {
  const [home, ...rest] = sections;

  return (
    <>
      <SectionNav items={sections} />
      <main>
        <HeroSection nextId={rest[0]?.id ?? home.id} />
        {rest.map((section) => (
          <PlaceholderSection key={section.id} id={section.id} title={section.label} />
        ))}
      </main>
    </>
  );
}
