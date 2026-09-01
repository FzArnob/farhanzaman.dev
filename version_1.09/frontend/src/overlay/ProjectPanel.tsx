import { useEffect, useRef } from 'react';
import type { Project } from '../types/profile';

/**
 * Act 05b's copy — the inside of an opened project core.
 *
 * Every remaining field of the project lands here: scope_of_work, challenges,
 * future_scope, methodology, current_status, the date range and the media list. That
 * is the whole of the old /work?id= page, in a place instead of on a page, with no
 * route change and no reload.
 */
export function ProjectPanel({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus moves into the chamber on open so a keyboard user is not left behind it.
  useEffect(() => {
    if (project) closeRef.current?.focus();
  }, [project]);

  if (!project) return null;

  const tech = String(project.tech_stack || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const images = (project.media ?? []).filter((m) => m.media_type === 'Image');

  const dates = [
    project.start_date ? new Date(project.start_date).getFullYear() : null,
    project.last_contribution_date ? new Date(project.last_contribution_date).getFullYear() : null,
  ].filter(Boolean);

  return (
    <div className="prism-chamber" role="dialog" aria-modal="true" aria-label={`${project.name} case study`}>
      <div className="prism-chamber-inner" ref={panelRef}>
        <header className="prism-chamber-head">
          <div>
            <p className="prism-act-num">
              <span>05b</span>
              <i />
              Case study
            </p>
            <h2 className="prism-chamber-title">{project.name}</h2>
            <p className="prism-detail-meta">
              {project.work_role} · {project.type} · {project.stack}
              {dates.length > 0 && ` · ${dates.join(' → ')}`}
            </p>
          </div>
          <button ref={closeRef} type="button" className="prism-close" onClick={onClose} aria-label="Close case study">
            Esc
          </button>
        </header>

        <div className="prism-chamber-body">
          <section>
            <h3>What it is</h3>
            <p dangerouslySetInnerHTML={{ __html: project.details }} />
          </section>

          {project.scope_of_work && (
            <section>
              <h3>Scope of work</h3>
              <p>{project.scope_of_work}</p>
            </section>
          )}

          {project.challenges && (
            <section>
              <h3>Challenges</h3>
              <p>{project.challenges}</p>
            </section>
          )}

          {project.future_scope && (
            <section>
              <h3>Future scope</h3>
              <p>{project.future_scope}</p>
            </section>
          )}

          <section>
            <h3>How it was run</h3>
            <dl className="prism-facts">
              {project.methodology && (
                <div>
                  <dt>Methodology</dt>
                  <dd>{project.methodology}</dd>
                </div>
              )}
              <div>
                <dt>Status</dt>
                <dd>{project.current_status}</dd>
              </div>
              {project.live_url && (
                <div>
                  <dt>Live</dt>
                  <dd>
                    <a href={project.live_url} target="_blank" rel="noreferrer">
                      {project.live_text || project.live_url}
                    </a>
                  </dd>
                </div>
              )}
              {project.source_url && (
                <div>
                  <dt>Source</dt>
                  <dd>
                    <a href={project.source_url} target="_blank" rel="noreferrer">
                      Repository
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section>
            <h3>Tech stack</h3>
            <p className="prism-chips">
              {tech.map((item, i) => (
                <span key={`${item}-${i}`} className="prism-chip">
                  {item}
                </span>
              ))}
            </p>
          </section>

          {images.length > 0 && (
            <section>
              <h3>
                Media <span className="prism-count">{images.length}</span>
              </h3>
              <div className="prism-media-grid">
                {images.slice(0, 9).map((media) => (
                  <a key={media.media_id} href={media.media_link} target="_blank" rel="noreferrer">
                    <img src={media.media_link} alt={`${project.name} screenshot`} loading="lazy" />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
