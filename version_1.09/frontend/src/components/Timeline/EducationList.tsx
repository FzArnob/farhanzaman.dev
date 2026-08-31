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
    <div className="column-2" id="education">
      <br />
      <br />
      <div className="topic">Education</div>
      <br />
      <br />
      {educations.slice(0, length).map((education) => (
        <div
          className="point-box"
          key={education.education_id}
          onClick={() => window.open(education.institute_url)}
        >
          <Hotspot />
          <div className="box-header">{education.subject}</div>
          <div className="box-sub-header">
            <a>
              <span className="cross-theme wobble" data-animation="upscale">
                {education.institute_name}
              </span>
            </a>
            <br />
            {education.end_date
              ? 'Graduation year of ' + education.end_date
              : education.start_date + ' - Present'}
          </div>
          <div className="box-description">{education.activity}</div>
        </div>
      ))}
    </div>
  );
}
