import { useMemo } from 'react';
import { buildExpertiseGraph, projectNames } from '../lib/expertiseGraph';
import {
  constellationState,
  forgeState,
  galleryState,
  latticeState,
  prismFocus,
  spineFocus,
  turbineState,
} from '../three/liveState';
import { useStageState } from '../three/StageState';
import type { Profile } from '../types/profile';
import { ActSection } from './ActSection';
import { usePolled } from './usePolled';

/**
 * The eight copy blocks.
 *
 * Every field here comes straight out of data/profile.json. Nothing has been rewritten,
 * shortened or invented — the vessel changed, the content did not.
 */

function fmtYear(date: string | null, present: string): string {
  if (present === '1') return 'now';
  if (!date) return '—';
  return String(date).slice(0, 4);
}

/* ------------------------------------------------------------------ 01 */

export function PrismCopy({ profile }: { profile: Profile }) {
  const { info } = profile;
  return (
    <ActSection id="prism" eyebrow="Hello" title={info.full_name} align="left" drift={18}>
      <ul className="prism-designations">
        {info.designations.map((role, i) => (
          <li key={role}>
            <button
              type="button"
              className="prism-role"
              onMouseEnter={() => (prismFocus.beam = i)}
              onFocus={() => (prismFocus.beam = i)}
              onMouseLeave={() => (prismFocus.beam = -1)}
              onBlur={() => (prismFocus.beam = -1)}
            >
              <i style={{ background: `var(--band-${i === 0 ? '0' : i === 1 ? '4' : '8'})` }} />
              {role}
            </button>
          </li>
        ))}
      </ul>
      <p className="prism-lead">{info.intro_text}</p>
      <div className="prism-actions">
        <a className="prism-btn prism-btn-solid" href={info.resume_url} target="_blank" rel="noreferrer">
          Résumé
        </a>
        <a className="prism-btn" href={info.github_url} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="prism-btn" href={info.linkedin_url} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
      <p className="prism-hint">Scroll to travel · {profile.projects.length} projects ahead</p>
    </ActSection>
  );
}

/* ------------------------------------------------------------------ 02 */

export function SpineCopy({ profile }: { profile: Profile }) {
  return (
    <ActSection id="spine" eyebrow="Background" title="Where this came from">
      <div className="prism-cols">
        <div className="prism-col">
          <h3 className="prism-col-head">
            <i className="dot dot-teal" /> Education
          </h3>
          <ul className="prism-list">
            {profile.educations.map((edu) => (
              <li
                key={edu.education_id}
                onMouseEnter={() => (spineFocus.id = `education-${edu.education_id}`)}
                onMouseLeave={() => (spineFocus.id = '')}
              >
                <a href={edu.institute_url} target="_blank" rel="noreferrer">
                  {edu.institute_name}
                </a>
                <span className="prism-meta">
                  {edu.subject} · {fmtYear(edu.start_date, '0')} → {fmtYear(edu.end_date, edu.is_present)}
                </span>
                {edu.activity && <span className="prism-note">{edu.activity}</span>}
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
              <li
                key={job.experience_id}
                onMouseEnter={() => (spineFocus.id = `experience-${job.experience_id}`)}
                onMouseLeave={() => (spineFocus.id = '')}
              >
                <a href={job.institute_url} target="_blank" rel="noreferrer">
                  {job.institute_name}
                </a>
                <span className="prism-meta">
                  {job.position} · {fmtYear(job.start_date, '0')} →{' '}
                  {fmtYear(job.end_date, job.is_present)}
                </span>
                {job.project_details && <span className="prism-note">{job.project_details}</span>}
                {job.project_text_1 && job.project_url_1 && (
                  <a className="prism-chip" href={job.project_url_1} target="_blank" rel="noreferrer">
                    {job.project_text_1}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="prism-hint">Time is depth — you are flying from the far end toward now.</p>
    </ActSection>
  );
}

/* ------------------------------------------------------------------ 03 */

export function LatticeCopy({ profile }: { profile: Profile }) {
  const stage = useStageState();
  const graph = useMemo(
    () => buildExpertiseGraph(profile.expertises, profile.projects),
    [profile.expertises, profile.projects]
  );
  const hovered = usePolled(latticeHovered);
  const index = stage.expertise >= 0 ? stage.expertise : hovered;
  const node = index >= 0 ? graph.nodes[index] : null;
  const linked = node ? projectNames(node, profile.projects) : [];

  return (
    <ActSection id="lattice" eyebrow="Expertise" title={`${graph.nodes.length} technologies, and what binds them`}>
      {node ? (
        <div className="prism-detail">
          <h3 className="prism-detail-title">{node.name}</h3>
          <p className="prism-detail-meta">
            {node.level} · {node.duration} months
            {node.projects.length > 0 && ` · ${node.projects.length} project${node.projects.length > 1 ? 's' : ''}`}
          </p>
          <p className="prism-lead">{node.description}</p>
          {linked.length > 0 && (
            <p className="prism-chips">
              {linked.map((name) => (
                <span key={name} className="prism-chip">
                  {name}
                </span>
              ))}
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="prism-lead">{profile.info.expertise_preference_details}</p>
          <p className="prism-note">
            Node size is time spent, glow is level, and an edge means a real project used
            both — {graph.edges.length} of them, derived from the data itself.
          </p>
        </>
      )}
      <p className="prism-hint">Drag to spin · click a node</p>
    </ActSection>
  );
}

/** Read through a stable function so usePolled keeps one identity across renders. */
function latticeHovered(): number {
  return latticeState.hovered;
}

/* ------------------------------------------------------------------ 04 */

const readTurbine = () => turbineState.index;

export function TurbineCopy({ profile }: { profile: Profile }) {
  const index = usePolled(readTurbine);
  const skill = profile.skills[Math.min(index, profile.skills.length - 1)];
  if (!skill) return null;
  return (
    <ActSection id="turbine" eyebrow="Skills" title="Twelve blades, one glance">
      <div className="prism-detail">
        <h3 className="prism-detail-title">{skill.name}</h3>
        <p className="prism-detail-meta">
          <span className="prism-figure">{skill.percentage}%</span>
          <span> · {skill.duration} months</span>
        </p>
        <p className="prism-lead">{skill.description}</p>
        <div className="prism-bar" role="meter" aria-valuenow={Number(skill.percentage)} aria-valuemin={0} aria-valuemax={100} aria-label={skill.name}>
          <i style={{ width: `${skill.percentage}%` }} />
        </div>
      </div>
      <p className="prism-hint">
        Blade length is the percentage, blade twist is the months — {index + 1} of{' '}
        {profile.skills.length}
      </p>
    </ActSection>
  );
}

/* ------------------------------------------------------------------ 05 */

const readForge = () => forgeState.index;

export function ForgeCopy({ profile }: { profile: Profile }) {
  const stage = useStageState();
  const index = usePolled(readForge);
  const project = profile.projects[Math.min(index, profile.projects.length - 1)];
  if (!project) return null;

  const tech = String(project.tech_stack || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    <ActSection id="forge" eyebrow={`Works · ${index + 1} / ${profile.projects.length}`} title={project.name}>
      <p className="prism-detail-meta">
        {project.work_role} · {project.type} · {project.stack}
      </p>
      {/*
        `details` is authored as HTML in profile.json — the flat site renders it the
        same way. CSS clamps it to five lines here; the full text is in the DOM and
        shown in full inside the case-study chamber.
      */}
      <p className="prism-lead" dangerouslySetInnerHTML={{ __html: project.details }} />
      <p className="prism-chips">
        {tech.map((item) => (
          <span key={item} className="prism-chip">
            {item}
          </span>
        ))}
      </p>
      <div className="prism-actions">
        <button
          type="button"
          className="prism-btn prism-btn-solid"
          onClick={() => stage.setOpenProject(project.project_id)}
        >
          View case study
        </button>
        {project.live_url && (
          <a className="prism-btn" href={project.live_url} target="_blank" rel="noreferrer">
            {project.live_text || 'Live'}
          </a>
        )}
        {project.source_url && (
          <a className="prism-btn" href={project.source_url} target="_blank" rel="noreferrer">
            Source
          </a>
        )}
      </div>
      <p className="prism-hint">
        <span className={`prism-status prism-status-${project.current_status.toLowerCase().replace(/\s+/g, '-')}`}>
          {project.current_status}
        </span>
        Scroll to turn the ring
      </p>
    </ActSection>
  );
}

/* ------------------------------------------------------------------ 06 */

const readConstellation = () => constellationState.hovered;

export function ConstellationCopy({ profile }: { profile: Profile }) {
  const stage = useStageState();
  const hovered = usePolled(readConstellation);
  const index = hovered >= 0 ? hovered : stage.achievement;
  const item = index >= 0 ? profile.achievements[index] : null;

  return (
    <ActSection id="constellation" eyebrow="Achievements" title={`${profile.achievements.length} certifications, plotted`}>
      {item ? (
        <div className="prism-detail">
          <h3 className="prism-detail-title">{item.name}</h3>
          <p className="prism-detail-meta">
            {item.level} · {new Date(item.certification_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
          </p>
          <p className="prism-lead">{item.description}</p>
          <div className="prism-actions">
            <a className="prism-btn prism-btn-solid" href={item.certification_url} target="_blank" rel="noreferrer">
              View certificate
            </a>
          </div>
        </div>
      ) : (
        <>
          <p className="prism-lead">
            Horizontal position is the date it was earned and distance from the axis is the
            level, so the shape of the constellation is the trajectory. Lines join
            certificates from the same issuer.
          </p>
          <ul className="prism-inline-list">
            {profile.achievements.map((a, i) => (
              <li key={a.achievement_id}>
                <button type="button" onClick={() => stage.setAchievement(i)}>
                  {a.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="prism-hint">Hover a tile to turn it</p>
    </ActSection>
  );
}

/* ------------------------------------------------------------------ 07 */

const readGallery = () => galleryState.hovered;

export function GalleryCopy({ profile }: { profile: Profile }) {
  const stage = useStageState();
  const hovered = usePolled(readGallery);
  const item = hovered >= 0 ? profile.gallery[hovered] : null;
  const categories = useMemo(
    () => [...new Set(profile.gallery.map((g) => g.category))].sort(),
    [profile.gallery]
  );

  return (
    <ActSection id="gallery" eyebrow="Hobbies" title={item ? item.name : 'The other half'}>
      {item ? (
        <>
          <p className="prism-detail-meta">{item.category}</p>
          <p className="prism-lead">{item.description}</p>
          <div className="prism-actions">
            <button
              type="button"
              className="prism-btn prism-btn-solid"
              onClick={() => stage.setLightbox(hovered)}
            >
              Open full size
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="prism-lead">{profile.info.about_text}</p>
          <p className="prism-chips">
            {categories.map((category) => (
              <span key={category} className="prism-chip">
                {category}
              </span>
            ))}
          </p>
          {/*
            Hovering a frame in 3D is how this act is meant to be read, but a touch
            device has no hover — so the works are also listed here. Same content,
            same lightbox, reachable by tap and by keyboard.
          */}
          <ul className="prism-inline-list">
            {profile.gallery.map((item, i) => (
              <li key={item.gallery_item_id}>
                <button type="button" onClick={() => stage.setLightbox(i)}>
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="prism-hint">
        {profile.gallery.length} works down the hall · a video wall at the far end
      </p>
    </ActSection>
  );
}
