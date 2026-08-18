import { Link } from 'react-router-dom';
import { useWindowSize } from '../../hooks/useWindowSize';
import type { Project } from '../../types/profile';

function columnsFor(width: number): number {
  switch (true) {
    case width >= 600 && width < 1200:
      return 2;
    case width >= 1200 && width < 1800:
      return 3;
    case width >= 1800 && width < 2400:
      return 4;
    case width >= 2400:
      return 5;
    default:
      return 1;
  }
}

function FullWorkCard({ work, width, index }: { work: Project; width: number; index: number }) {
  const stack = work.tech_stack
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Link
      className="work-card-full bg2 work-card"
      to={'/work?work_id=' + (index + 1)}
      style={{ width: width + 'px' }}
    >
      <img
        className="work-card-image-full"
        src={work.logo_image}
        alt={work.name}
        loading="lazy"
        decoding="async"
      />
      <div className="work-card-tags">
        <div className="work-card-tag c-theme">{work.type}</div>
        <div className="work-card-tag c-theme-second">{work.stack}</div>
      </div>
      <div className="work-card-title-full c1">{work.name}</div>
      <div className="work-card-des-full">{work.work_role}</div>
      <div className="work-card-details c2">{work.details}</div>
      <div className="work-card-stack" aria-hidden="true">
        {stack.map((tech) => (
          <span key={tech}>{tech}</span>
        ))}
      </div>
    </Link>
  );
}

/** Full project listing on the works page. Reveals as a wave from the centre out. */
export function WorksGrid({ projects }: { projects: Project[] }) {
  const { width } = useWindowSize();
  const numColumn = columnsFor(width);
  const workCardWidth = width / numColumn - 70;

  return (
    <div className="row" id="works">
      <div className="works" data-reveal="stagger" data-reveal-from="center">
        {projects.map((work, index) => (
          <FullWorkCard key={work.project_id} work={work} width={workCardWidth} index={index} />
        ))}
      </div>
    </div>
  );
}
