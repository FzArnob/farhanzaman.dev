import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  const onMouseOver = () => {
    cardRef.current?.classList.add('animate-infinite-tossing');
    if (imageRef.current) imageRef.current.style.filter = 'blur(0px)';
    if (typeRef.current) typeRef.current.style.display = 'flex';
    if (stackRef.current) stackRef.current.style.display = 'flex';
  };

  const onMouseLeave = () => {
    cardRef.current?.classList.remove('animate-infinite-tossing');
    if (imageRef.current) imageRef.current.style.filter = 'blur(1px)';
    if (typeRef.current) typeRef.current.style.display = 'none';
    if (stackRef.current) stackRef.current.style.display = 'none';
  };

  return (
    <div
      ref={cardRef}
      className="work-card-full bg2 work-card"
      style={{ width: width + 'px' }}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onClick={() => navigate('/work?work_id=' + (index + 1))}
    >
      <img ref={imageRef} className="work-card-image-full" src={work.logo_image} />
      <div className="work-card-tags">
        <div ref={typeRef} className="work-card-tag c-theme animate-slide-down">
          {work.type}
        </div>
        <div ref={stackRef} className="work-card-tag c-theme-second animate-slide-down">
          {work.stack}
        </div>
      </div>
      <div className="work-card-title-full c1">{work.name}</div>
      <div className="work-card-des-full">{work.work_role}</div>
      <div className="work-card-details c2">{work.details}</div>
    </div>
  );
}

/** Full project listing on the works page. */
export function WorksGrid({ projects }: { projects: Project[] }) {
  const { width } = useWindowSize();
  const numColumn = columnsFor(width);
  const workCardWidth = width / numColumn - 70;

  return (
    <div className="row" id="works">
      <div className="works">
        {projects.map((work, index) => (
          <FullWorkCard
            key={work.project_id}
            work={work}
            width={workCardWidth}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
