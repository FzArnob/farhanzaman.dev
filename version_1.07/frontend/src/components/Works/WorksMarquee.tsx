import { useWindowSize } from '../../hooks/useWindowSize';
import type { Project } from '../../types/profile';
import { WorkCard } from './WorkCard';

function columnsFor(width: number): number {
  switch (true) {
    case width >= 600 && width < 1200:
      return 2;
    case width >= 1200 && width < 1800:
      return 3;
    case width >= 1800 && width < 2400:
      return 3;
    case width >= 2400:
      return 3;
    default:
      return 2;
  }
}

/**
 * The endlessly scrolling strip on the home page: pairs of cards stacked in holders,
 * with the whole run duplicated into a second span so the CSS animation can loop.
 */
export function WorksMarquee({ projects }: { projects: Project[] }) {
  const { width } = useWindowSize();
  const numColumn = columnsFor(width);
  const buff = 2 * (numColumn + 1);
  const workCardWidth = Math.round(width / numColumn - buff / numColumn);
  const length = (numColumn + 1) * 2;
  const parentWidth = workCardWidth * (numColumn + 1) + buff;

  const holders = [];
  for (let i = 0; i < length; i += 2) {
    holders.push(
      <div className="work-card-holder" key={i}>
        <WorkCard work={projects[i]} width={workCardWidth} index={i} />
        <WorkCard work={projects[i + 1]} width={workCardWidth} index={i + 1} noBottomBorder />
      </div>
    );
  }

  return (
    <div className="marquee" id="works" style={{ width: parentWidth + 'px' }}>
      <div className="marquee-inner" style={{ width: parentWidth * 2 + 'px' }}>
        <span>{holders}</span>
        <span>{holders}</span>
      </div>
    </div>
  );
}
