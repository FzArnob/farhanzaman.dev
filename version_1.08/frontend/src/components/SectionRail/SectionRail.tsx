import { useEffect, useState } from 'react';

export interface RailSection {
  /** Element id to scroll to. */
  id: string;
  label: string;
}

/**
 * Right-edge section index. Real anchors, so it is keyboard-navigable and not just
 * decoration; the active entry is resolved with one IntersectionObserver.
 */
export function SectionRail({ sections }: { sections: RailSection[] }) {
  // Empty until a section owns the middle of the viewport — the hero is not a
  // section, so nothing should read as current while it is on screen.
  const [active, setActive] = useState('');

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);
    if (targets.length === 0) return;

    // Middle band of the viewport: whichever section owns the centre wins.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav id="section-rail" aria-label="Page sections">
      {sections.map((section) => (
        <a
          key={section.id}
          className="rail-item"
          href={`#${section.id}`}
          data-active={section.id === active || undefined}
          aria-current={section.id === active ? 'true' : undefined}
        >
          <span className="rail-label">{section.label}</span>
          <span className="rail-tick" aria-hidden="true"></span>
        </a>
      ))}
    </nav>
  );
}
