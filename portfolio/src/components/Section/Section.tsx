import type { ComponentPropsWithRef } from 'react';

interface SectionProps extends ComponentPropsWithRef<'section'> {
  id: string;
  /** Name of a `[data-palette]` block in tokens.css; colours shift per section. */
  palette?: string;
}

/** One screen of the single-scroll page. Its `id` is what the side nav links to. */
export function Section({ palette, ...rest }: SectionProps) {
  return <section data-palette={palette} {...rest} />;
}
