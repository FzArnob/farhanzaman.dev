import { Link } from 'react-router-dom';
import type { Project } from '../../types/profile';

interface WorkCardProps {
  work: Project;
  width: number;
  /** Zero-based position; the work page is addressed as /work?work_id=index+1. */
  index: number;
  noBottomBorder?: boolean;
}

/**
 * Compact card used inside the home page marquee.
 *
 * A real link rather than a div with an onClick, so it is keyboard reachable and
 * middle-clickable. All the hover state is CSS now — the old version wrote inline
 * styles to four refs on every pointer event.
 */
export function WorkCard({ work, width, index, noBottomBorder }: WorkCardProps) {
  return (
    <Link
      className="work-card bg2"
      to={'/work?work_id=' + (index + 1)}
      style={{ width: width + 'px', borderBottom: noBottomBorder ? 'none' : undefined }}
    >
      <img
        className="work-card-image"
        src={work.logo_image}
        alt={work.name}
        loading="lazy"
        decoding="async"
      />
      <div className="work-card-tags">
        <div className="work-card-tag c-theme">{work.type}</div>
        <div className="work-card-tag c-theme-second">{work.stack}</div>
      </div>
      <div className="work-card-title c1">{work.name}</div>
    </Link>
  );
}
