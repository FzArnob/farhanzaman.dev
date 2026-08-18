import type { Education } from '../../types/profile';
import { Hotspot } from './Hotspot';

interface Props {
  educations: Education[];
  /** The home page teaser shows two entries. */
  extended: boolean;
}

export function EducationList({ educations, extended }: Props) {
  const length = extended ? educations.length : 2;

  return (
    <div className="column-2 timeline-column" id="education">
      <br />
      <br />
      <div className="topic" data-reveal="rise">
        Education
      </div>
      <br />
      <br />
      {educations.slice(0, length).map((education, index) => (
        <div
          className="point-box"
          key={education.education_id}
          data-reveal="slide-left"
          data-reveal-delay={index * 90}
        >
          <Hotspot />
          <div className="box-meta">
            {education.end_date
              ? 'Graduated ' + education.end_date
              : education.start_date + ' — present'}
          </div>
          {/* The heading block is the link, rather than a div with an onClick:
              keyboard reachable, middle-clickable, and it gets the focus ring. */}
          <a
            className="box-link"
            href={education.institute_url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="box-header">{education.subject}</div>
            <div className="box-sub-header">
              <span className="cross-theme wobble" data-animation="upscale">
                {education.institute_name}
              </span>
            </div>
          </a>
          <div className="box-description">{education.activity}</div>
        </div>
      ))}
    </div>
  );
}
