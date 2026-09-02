import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/**
 * What a browser without WebGL sees.
 *
 * Not a mode, and not offered as a choice — nobody switches to this, it simply
 * catches the case where the canvas cannot run: a locked-down work laptop, a browser
 * with hardware acceleration disabled, prefers-reduced-motion.
 *
 * It is the same design language rather than a different site: same nine sections in
 * the same order, the same Titillium face, the same two brand colours, and the mark
 * rendered with CSS instead of geometry. Every field is present, so a recruiter who
 * lands here still sees all of the work.
 */
export function StaticFallback() {
  const profile = useProfile();
  const { info } = profile;
  useDocumentTitle(info.full_name);

  const ordered = [...profile.projects].sort((a, b) => {
    const when = (raw: string) => (/present/i.test(raw) ? Date.now() : new Date(raw).getTime() || 0);
    return when(b.last_contribution_date) - when(a.last_contribution_date);
  });

  return (
    <div className="prism-static">
      <header className="prism-static-top">
        <span className="prism-mark">
          <img src="/view/static/favicon.svg" alt="" width="26" height="26" />
          <span>{info.nick_name}</span>
        </span>
        <p className="prism-static-note">
          Your browser cannot run WebGL, so this is the flat rendering of the same site.
        </p>
      </header>

      <section id="static-intro" className="prism-static-section">
        <p className="prism-eyebrow">Hello, I am</p>
        <h1 className="prism-head">{info.full_name}</h1>
        <p className="prism-static-roles">{info.designations.join(' · ')}</p>
        <p className="prism-text">{info.intro_text}</p>
        <p className="prism-actions">
          <a className="prism-btn prism-btn-solid" href={info.resume_url}>
            Résumé
          </a>
          <a className="prism-btn" href={info.github_url}>
            GitHub
          </a>
          <a className="prism-btn" href={info.linkedin_url}>
            LinkedIn
          </a>
        </p>
      </section>

      <section id="static-background" className="prism-static-section">
        <p className="prism-eyebrow">Where this came from</p>
        <h2 className="prism-head">Background</h2>
        <p className="prism-text">{info.about_text}</p>
        <div className="prism-cols">
          <div className="prism-col">
            <h3 className="prism-col-head">
              <i className="dot dot-teal" /> Education
            </h3>
            <ul className="prism-list">
              {profile.educations.map((edu) => (
                <li key={edu.education_id}>
                  <a href={edu.institute_url}>{edu.institute_name}</a>
                  <span className="prism-meta">
                    {edu.subject} · {String(edu.start_date).slice(0, 4)} →{' '}
                    {edu.is_present === '1' ? 'now' : String(edu.end_date ?? '').slice(0, 4)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="prism-col">
            <h3 className="prism-col-head">
              <i className="dot dot-crimson" /> Experience
            </h3>
            <ul className="prism-list">
              {profile.experiences.map((job) => (
                <li key={job.experience_id}>
                  <a href={job.institute_url}>{job.institute_name}</a>
                  <span className="prism-meta">
                    {job.position} · {String(job.start_date).slice(0, 4)} →{' '}
                    {job.is_present === '1' ? 'now' : String(job.end_date ?? '').slice(0, 4)}
                  </span>
                  {job.project_details && <span className="prism-meta">{job.project_details}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="static-expertise" className="prism-static-section">
        <p className="prism-eyebrow">{profile.expertises.length} technologies</p>
        <h2 className="prism-head">Expertise</h2>
        {/* No descriptions here either — name, level and time, as in the 3D act. */}
        <ul className="prism-static-cloud">
          {profile.expertises.map((item) => (
            <li key={item.expertise_id} className={/beginner/i.test(item.level) ? 'is-beginner' : undefined}>
              {item.name}
              <em>{item.duration}mo</em>
            </li>
          ))}
        </ul>
      </section>

      <section id="static-skills" className="prism-static-section">
        <p className="prism-eyebrow">{profile.skills.length} skills</p>
        <h2 className="prism-head">Skills</h2>
        <ul className="prism-static-bars">
          {profile.skills.map((skill) => (
            <li key={skill.skill_id}>
              <span>{skill.name}</span>
              <span className="prism-bar">
                <i style={{ width: `${skill.percentage}%` }} />
              </span>
              <em>{skill.percentage}%</em>
            </li>
          ))}
        </ul>
      </section>

      <section id="static-achievements" className="prism-static-section">
        <p className="prism-eyebrow">{profile.achievements.length} certifications</p>
        <h2 className="prism-head">Achievements</h2>
        <ul className="prism-static-grid">
          {profile.achievements.map((item) => (
            <li key={item.achievement_id}>
              <a href={item.certification_url}>
                <img src={`/${item.certification_logo.replace(/^\/+/, '')}`} alt="" width="48" height="48" />
                <strong>{item.name}</strong>
                <span className="prism-meta">
                  {item.level} · {String(item.certification_date).slice(0, 4)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section id="static-works" className="prism-static-section">
        <p className="prism-eyebrow">{ordered.length} projects</p>
        <h2 className="prism-head">Works</h2>
        <ul className="prism-static-works">
          {ordered.map((project) => (
            <li key={project.project_id}>
              <h3>{project.name}</h3>
              <p className="prism-detail-meta">
                {project.work_role} · {project.type} · {project.stack}
              </p>
              <p className="prism-text" dangerouslySetInnerHTML={{ __html: project.details }} />
              <p className="prism-chips">
                {String(project.tech_stack || '')
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((tech, i) => (
                    <span key={`${tech}-${i}`} className="prism-chip">
                      {tech}
                    </span>
                  ))}
              </p>
              <p className="prism-actions">
                {project.live_url && (
                  <a className="prism-btn" href={project.live_url}>
                    {project.live_text || 'Live'}
                  </a>
                )}
                {project.source_url && (
                  <a className="prism-btn" href={project.source_url}>
                    Source
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="static-hobbies" className="prism-static-section">
        <p className="prism-eyebrow">{profile.gallery.length} works</p>
        <h2 className="prism-head">Hobbies</h2>
        <ul className="prism-static-grid">
          {profile.gallery.map((item) => (
            <li key={item.gallery_item_id}>
              <a href={item.image_url}>
                <img src={item.thumb_url} alt={item.description || item.name} loading="lazy" />
                <strong>{item.name}</strong>
                <span className="prism-meta">{item.category}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section id="static-gaming" className="prism-static-section">
        <p className="prism-eyebrow">Run Fz Run</p>
        <h2 className="prism-head">Gaming</h2>
        <p className="prism-text">
          Gameplay clips live on the channel.{' '}
          <a href="https://www.youtube.com/@runfzrun">Open it on YouTube</a>.
        </p>
      </section>

      <section id="static-contact" className="prism-static-section">
        <p className="prism-eyebrow">Contact</p>
        <h2 className="prism-head">Let’s build something</h2>
        <p className="prism-text">{info.contact_preference_details}</p>
        <p className="prism-static-contact">
          <a className="prism-address" href={`mailto:${info.email}`}>
            {info.email}
          </a>
          <a href={`tel:${info.phone}`}>{info.phone}</a>
          <span>{info.address}</span>
        </p>
        <p className="prism-actions">
          <a className="prism-btn" href={info.github_url}>
            GitHub
          </a>
          <a className="prism-btn" href={info.linkedin_url}>
            LinkedIn
          </a>
          <a className="prism-btn" href={info.whatsapp_url}>
            WhatsApp
          </a>
        </p>
      </section>
    </div>
  );
}
