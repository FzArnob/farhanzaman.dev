import type { Project } from '../../types/profile';

function Media({ mediaType, link }: { mediaType: string; link: string }) {
  if (mediaType === 'Image') {
    return (
      <a className="work-media-link" href={link} target="_blank" rel="noreferrer">
        <img className="work-media" src={link} />
      </a>
    );
  }
  if (mediaType === 'Vimeo') {
    return (
      <iframe
        src={link}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; encrypted-media"
        className="work-media"
      ></iframe>
    );
  }
  return (
    <video className="work-media" controls>
      <source src={link} type="video/mp4" /> Your browser does not support the video tag.
    </video>
  );
}

export function ProjectDetails({ project }: { project: Project }) {
  const techStackList = project.tech_stack.split(',');

  return (
    <div className="row" style={{ justifyContent: 'center' }}>
      <div className="work-left">
        <div className="work-details">
          <img
            className="img-float-left work-logo animate-left"
            src={project.logo_image}
            alt="Logo Image"
          />
          <span dangerouslySetInnerHTML={{ __html: project.details }} />
        </div>
        <div className="work-gallery animate-left">
          {project.media.map((item) => (
            <Media key={item.media_id} mediaType={item.media_type} link={item.media_link} />
          ))}
        </div>
      </div>
      <div className="work-right">
        <div className="work-stats animate-top">
          <div className="work-card-tags-view">
            <div className="work-card-tag-view c-theme">{project.type}</div>
            <div className="work-card-tag-view c-theme-second">{project.stack}</div>
          </div>
          <b>Start Date:</b> {project.start_date}
          <br />
          <br />
          <b>Last Contribution Date:</b> {project.last_contribution_date}
          <br />
          <br />
          <b>Scope of Work:</b> {project.scope_of_work}
          <br />
          <br />
          <div className="work-links-view">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                style={{ marginBottom: '10px' }}
                className="work-link-view c1"
              >
                {project.live_text}
              </a>
            )}
            {project.source_url && (
              <a
                href={project.source_url}
                target="_blank"
                rel="noreferrer"
                style={{ marginBottom: '10px' }}
                className="work-link-view c1"
              >
                Source
              </a>
            )}
          </div>
          <b>Current Status:</b> {project.current_status}
          <br />
          <br />
          <b>Methodology:</b> {project.methodology}
          <br />
          <br />
          <b>Tech Stack:</b>
          <br />
          {techStackList.map((tech, index) => (
            <div className="tech c1" key={index}>
              {tech.trim()}
            </div>
          ))}
          <br />
          <b>Challenges and Risks:</b> {String(project.challenges)}
          <br />
          <br />
          {/* Kept verbatim: the original template printed the literal "null" when unset. */}
          <b>Future Scope:</b> {String(project.future_scope)}
          <br />
          <br />
        </div>
      </div>
    </div>
  );
}
