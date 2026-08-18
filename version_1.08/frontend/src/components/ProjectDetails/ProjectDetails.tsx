import type { ReactNode } from 'react';
import type { Project } from '../../types/profile';

function Media({ mediaType, link, title }: { mediaType: string; link: string; title: string }) {
  if (mediaType === 'Image') {
    return (
      <a className="work-media-link" href={link} target="_blank" rel="noreferrer">
        <img className="work-media" src={link} alt={title} loading="lazy" decoding="async" />
      </a>
    );
  }
  if (mediaType === 'Vimeo') {
    return (
      <iframe
        src={link}
        title={title}
        frameBorder="0"
        allowFullScreen
        allow="encrypted-media"
        loading="lazy"
        className="work-media"
      ></iframe>
    );
  }
  return (
    <video className="work-media" controls preload="none">
      <source src={link} type="video/mp4" /> Your browser does not support the video tag.
    </video>
  );
}

/** One labelled row of the dossier. Renders nothing when there is nothing to say. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  const empty =
    children === null ||
    children === undefined ||
    children === '' ||
    children === 'null' ||
    children === 'None';
  if (empty) return null;
  return (
    <div className="dossier-row">
      <span className="dossier-key">{label}</span>
      <div className="dossier-value">{children}</div>
    </div>
  );
}

/**
 * Comma-separated profile fields render as chips rather than one run-on line.
 * Returns nothing at all — label included — when the field is unset, which is how
 * the literal "null" that used to print under "Future Scope" disappears.
 */
function ListRow({ label, value }: { label: string; value: string | null }) {
  if (!value || value === 'null' || value === 'None') return null;
  const items = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (items.length === 0) return null;

  return (
    <div className="dossier-row">
      <span className="dossier-key">{label}</span>
      <div className="tech-stack">
        {items.map((item, index) => (
          <div className="tech c1" key={index}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectDetails({ project }: { project: Project }) {
  return (
    <div className="row" style={{ justifyContent: 'center' }}>
      <div className="work-left">
        <div className="work-details" data-reveal="rise">
          <img
            className="img-float-left work-logo"
            src={project.logo_image}
            alt={project.name + ' logo'}
          />
          <span dangerouslySetInnerHTML={{ __html: project.details }} />
        </div>
        <div className="work-gallery" data-reveal="stagger" data-reveal-step="70">
          {project.media.map((item) => (
            <Media
              key={item.media_id}
              mediaType={item.media_type}
              link={item.media_link}
              title={`${project.name} media`}
            />
          ))}
        </div>
      </div>

      <div className="work-right">
        <div className="work-stats" data-reveal="stagger" data-reveal-step="25">
          <div className="work-card-tags-view">
            <div className="work-card-tag-view c-theme">{project.type}</div>
            <div className="work-card-tag-view c-theme-second">{project.stack}</div>
          </div>

          <Row label="Start date">{project.start_date}</Row>
          <Row label="Last contribution">{project.last_contribution_date}</Row>
          <Row label="Current status">{project.current_status}</Row>
          <Row label="Methodology">{project.methodology}</Row>
          <Row label="Scope of work">{project.scope_of_work}</Row>

          {(project.live_url || project.source_url) && (
            <div className="work-links-view">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="work-link-view c1"
                >
                  {project.live_text || 'Open'}
                </a>
              )}
              {project.source_url && (
                <a
                  href={project.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="work-link-view c1"
                >
                  Source
                </a>
              )}
            </div>
          )}

          <ListRow label="Tech stack" value={project.tech_stack} />
          <ListRow label="Challenges and risks" value={project.challenges} />
          <ListRow label="Future scope" value={project.future_scope} />
        </div>
      </div>
    </div>
  );
}
