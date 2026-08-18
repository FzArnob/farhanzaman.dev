import type { Education, Experience, Qualification as QualificationItem } from '../../types/profile';

/** Interleaves education and experience so the About timeline alternates between the two. */
export function combineAndLabel(
  educations: Education[],
  experiences: Experience[]
): QualificationItem[] {
  const combinedArray: QualificationItem[] = [];
  let educationIndex = 0;
  let experienceIndex = 0;

  while (educationIndex < educations.length || experienceIndex < experiences.length) {
    if (educationIndex < educations.length) {
      combinedArray.push({ ...educations[educationIndex], type: 'education' });
      educationIndex++;
    }

    if (experienceIndex < experiences.length) {
      combinedArray.push({ ...experiences[experienceIndex], type: 'experience' });
      experienceIndex++;
    }
  }

  return combinedArray;
}

function QualificationData({ data }: { data: QualificationItem }) {
  const period = data.start_date + ' — ' + (data.is_present === '1' ? 'present' : data.end_date);

  if (data.type === 'education') {
    return (
      <div>
        <div className="box-meta">
          <span className="qual-kind">EDU</span> {period}
        </div>
        <div className="box-header">{data.subject}</div>
        <div className="box-sub-header">
          <a href={data.institute_url} target="_blank" rel="noreferrer">
            <span className="cross-theme wobble" data-animation="upscale">
              {data.institute_name}
            </span>
          </a>
        </div>
        <div className="box-description">{data.activity}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="box-meta">
        <span className="qual-kind">WORK</span> {period}
      </div>
      <div className="box-header">{data.position}</div>
      <div className="box-sub-header">
        <a href={data.institute_url} target="_blank" rel="noreferrer">
          <span className="cross-theme wobble" data-animation="upscale">
            {data.institute_name}
          </span>
        </a>
      </div>
      <div className="box-description">
        {`${data.project_details}`}
        {data.project_text_1 && (
          <>
            {', '}
            <a href={data.project_url_1 ?? undefined} target="_blank" rel="noreferrer">
              <span className="cross-theme wobble" data-animation="upscale">
                {data.project_text_1}
              </span>
            </a>
          </>
        )}
      </div>
    </div>
  );
}

/** Zig-zag timeline on the About page: even entries sit left of the line, odd entries right. */
export function Qualification({ items }: { items: QualificationItem[] }) {
  return (
    <div className="row ex" id="qualification">
      {items.map((data, index) =>
        index % 2 === 0 ? (
          <div className="row about-card-right" key={index}>
            <div className="column-2 right-align">
              <div
                className="ex-point-box-left bg2 move-right"
                data-reveal="slide-left"
                data-reveal-delay={index * 60}
              >
                <QualificationData data={data} />
              </div>
              <div className="ex-point-right bg1"></div>
            </div>
          </div>
        ) : (
          <div className="row about-card-left" key={index}>
            <div className="column-2 right-align"></div>
            <div className="column-2 left-align">
              <div
                className="ex-point-box-right bg2 move-left"
                data-reveal="slide-right"
                data-reveal-delay={index * 60}
              >
                <QualificationData data={data} />
              </div>
              <div className="ex-point-left bg1"></div>
            </div>
          </div>
        )
      )}
      <div className="ex-box-line about-line-left" data-reveal="spine"></div>
      <div className="ex-box-line about-line-right" data-reveal="spine"></div>
    </div>
  );
}
