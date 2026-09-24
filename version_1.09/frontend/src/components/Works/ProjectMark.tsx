import { forwardRef, type SyntheticEvent } from 'react';
import { hexString, logoSrc, monogramUri, projectRgb } from '../../lib/projectTheme';
import type { Project } from '../../types/profile';

/**
 * A project's logo on its own colour — the flat site's card image, now built from the
 * two fields profile.json carries instead of a pre-rendered thumbnail. A logo that
 * fails to load falls back to the project's initials, so a card is never blank.
 */
export const ProjectMark = forwardRef<HTMLDivElement, { project: Project; className?: string }>(
  function ProjectMark({ project, className }, ref) {
    const fallback = monogramUri(project.name);
    const onError = (event: SyntheticEvent<HTMLImageElement>) => {
      if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
    };
    return (
      <div
        ref={ref}
        className={'project-mark' + (className ? ' ' + className : '')}
        style={{ backgroundColor: hexString(projectRgb(project)) }}
      >
        <img src={logoSrc(project)} alt={`${project.name} logo`} loading="lazy" onError={onError} />
      </div>
    );
  }
);
