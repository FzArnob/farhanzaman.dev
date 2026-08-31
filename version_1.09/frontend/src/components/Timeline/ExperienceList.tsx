import type { Experience } from '../../types/profile';
import { Hotspot } from './Hotspot';

interface Props {
  experiences: Experience[];
  /** The home page teaser shows two entries. */
  extended: boolean;
}

export function ExperienceList({ experiences, extended }: Props) {
  const length = extended ? experiences.length : 2;

  return (
    <div className="column-2" id="experiences">
      <br />
      <br />
      <div className="topic">Experience</div>
      <br />
      <br />
      {experiences.slice(0, length).map((experience) => {
        const dates = experience.end_date
          ? experience.start_date + ' - ' + experience.end_date
          : experience.start_date + ' - Present';
        const description = experience.project_text_1
          ? experience.project_details + ', '
          : experience.project_details;

        return (
          <div className="point-box" key={experience.experience_id}>
            <Hotspot />
            <div className="box-header" onClick={() => window.open(experience.institute_url)}>
              {experience.position}
            </div>
            <div className="box-sub-header" onClick={() => window.open(experience.institute_url)}>
              <a>
                <span className="cross-theme wobble" data-animation="upscale">
                  {experience.institute_name}
                </span>
              </a>
              <br />
              {dates}
            </div>
            <div
              className="box-description"
              onClick={() =>
                window.open(experience.project_url_1 || experience.institute_url)
              }
            >
              {description}
              <a>
                <span className="cross-theme wobble" data-animation="upscale">
                  {experience.project_text_1 ? experience.project_text_1 : ''}
                </span>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
