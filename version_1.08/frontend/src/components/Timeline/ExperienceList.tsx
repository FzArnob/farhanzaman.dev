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
    <div className="column-2 timeline-column" id="experiences">
      <br />
      <br />
      <div className="topic" data-reveal="rise">
        Experience
      </div>
      <br />
      <br />
      {experiences.slice(0, length).map((experience, index) => {
        const dates = experience.end_date
          ? experience.start_date + ' — ' + experience.end_date
          : experience.start_date + ' — present';

        return (
          <div
            className="point-box"
            key={experience.experience_id}
            data-reveal="slide-right"
            data-reveal-delay={index * 90}
          >
            <Hotspot />
            <div className="box-meta">{dates}</div>
            <a
              className="box-link"
              href={experience.institute_url}
              target="_blank"
              rel="noreferrer"
            >
              <div className="box-header">{experience.position}</div>
              <div className="box-sub-header">
                <span className="cross-theme wobble" data-animation="upscale">
                  {experience.institute_name}
                </span>
              </div>
            </a>
            <div className="box-description">
              {experience.project_details}
              {experience.project_text_1 && (
                <>
                  {', '}
                  {/* Its own anchor, so the project URL survives — nesting it
                      inside a card-wide link would have been invalid markup. */}
                  <a
                    href={experience.project_url_1 ?? experience.institute_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="cross-theme wobble" data-animation="upscale">
                      {experience.project_text_1}
                    </span>
                  </a>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
