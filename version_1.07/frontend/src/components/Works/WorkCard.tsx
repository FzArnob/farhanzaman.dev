import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types/profile';

interface WorkCardProps {
  work: Project;
  width: number;
  /** Zero-based position; the work page is addressed as /work?work_id=index+1. */
  index: number;
  noBottomBorder?: boolean;
}

/** Compact card used inside the home page marquee. */
export function WorkCard({ work, width, index, noBottomBorder }: WorkCardProps) {
  const navigate = useNavigate();
  const imageRef = useRef<HTMLImageElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const onMouseOver = () => {
    if (imageRef.current) imageRef.current.style.filter = 'grayscale(0%)';
    if (typeRef.current) typeRef.current.style.display = 'flex';
    if (stackRef.current) stackRef.current.style.display = 'flex';
    titleRef.current?.classList.add('work-card-text-style');
  };

  const onMouseLeave = () => {
    if (imageRef.current) imageRef.current.style.filter = 'grayscale(20%) blur(1px) saturate(70%)';
    if (typeRef.current) typeRef.current.style.display = 'none';
    if (stackRef.current) stackRef.current.style.display = 'none';
    titleRef.current?.classList.remove('work-card-text-style');
  };

  return (
    <div
      className="work-card bg2"
      style={{ width: width + 'px', borderBottom: noBottomBorder ? 'none' : undefined }}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      onClick={() => navigate('/work?work_id=' + (index + 1))}
    >
      <img ref={imageRef} className="work-card-image" src={work.logo_image} />
      <div className="work-card-tags">
        <div ref={typeRef} className="work-card-tag c-theme animate-right">
          {work.type}
        </div>
        <div ref={stackRef} className="work-card-tag c-theme-second animate-right">
          {work.stack}
        </div>
      </div>
      <div ref={titleRef} className="work-card-title c1">
        {work.name}
      </div>
    </div>
  );
}
