import { useEffect, useState } from 'react';

/**
 * Id of the section that currently covers the middle of the viewport.
 */
export function useActiveSection<T extends string>(ids: readonly T[]): T | undefined {
  const [active, setActive] = useState<T | undefined>(ids[0]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (hit) setActive(hit.target.id as T);
      },
      // A 1px band across the middle of the screen.
      { rootMargin: '-50% 0px -50% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
