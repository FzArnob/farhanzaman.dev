import { useMemo, useState } from 'react';
import { orderProjects } from '../three/acts/Act06Works';
import {
  arcadeState,
  cloudState,
  constellationState,
  galleryState,
  prismFocus,
  spineFocus,
  turbineState,
  worksState,
} from '../three/liveState';
import { useStageState } from '../three/StageState';
import type { Profile } from '../types/profile';
import { ActSection } from './ActSection';
import { usePolled } from './usePolled';

/**
 * The nine copy blocks — the flat site's own sections, one for one.
 *
 * Every field comes straight out of data/profile.json and every call to action is the
 * one the flat site had: About Me, More, View Projects, Explore. The difference is
 * that they no longer navigate: "View all projects" opens the ring the camera is
 * already inside, and "Explore all" extends the hall it is already flying down.
 */

function year(date: string | null, present?: string): string {
  if (present === '1') return 'now';
  if (!date) return '—';
  if (/present/i.test(date)) return 'now';
  return String(date).slice(0, 4);
}

/* ------------------------------------------------------------------ 01 intro */

export function IntroCopy({ profile }: { profile: Profile }) {
  const { info } = profile;
  return (
    <ActSection id="intro" eyebrow="Hello, I am" title={info.full_name} drift={14}>
      <ul className="prism-roles">
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
              {role}
            </button>
          </li>
        ))}
      </ul>
      <p className="prism-text">{info.intro_text}</p>
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
    </ActSection>
  );
}

/* ------------------------------------------------------------- 02 background */

export function BackgroundCopy({ profile }: { profile: Profile }) {
  const [showAll, setShowAll] = useState(false);
  const { info } = profile;

  return (
    <ActSection id="background" eyebrow="Where this came from" title="Background">
      {showAll ? (
        <p className="prism-text prism-text-tall">{info.about_text}</p>
      ) : (
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
                    {edu.subject} · {year(edu.start_date)} → {year(edu.end_date, edu.is_present)}
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
                <li
                  key={job.experience_id}
                  onMouseEnter={() => (spineFocus.id = `experience-${job.experience_id}`)}
                  onMouseLeave={() => (spineFocus.id = '')}
                >
                  <a href={job.institute_url} target="_blank" rel="noreferrer">
                    {job.institute_name}
                  </a>
                  <span className="prism-meta">
                    {job.position} · {year(job.start_date)} → {year(job.end_date, job.is_present)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="prism-actions">
        <button type="button" className="prism-btn prism-btn-solid" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Back to the timeline' : 'About me'}
        </button>
      </div>
    </ActSection>
  );
}

/* -------------------------------------------------------------- 03 expertise */

const readCloudHover = () => cloudState.hovered;
const readCloudSelect = () => cloudState.selected;

export function ExpertiseCopy({ profile }: { profile: Profile }) {
  const hovered = usePolled(readCloudHover);
  const selected = usePolled(readCloudSelect);
  const index = selected >= 0 ? selected : hovered;
  const item = index >= 0 ? profile.expertises[index] : null;

  return (
    <ActSection id="expertise" eyebrow={`${profile.expertises.length} technologies`} title="Expertise">
      {item ? (
        /* Name, level and time only — the descriptions were dropped from this act. */
        <div className="prism-detail">
          <h3 className="prism-detail-title">{item.name}</h3>
          <p className="prism-detail-meta">
            {item.level} · {item.duration} months
          </p>
        </div>
      ) : (
        <p className="prism-text prism-text-short">
          Hover or tap a name on the sphere to see how long it has been in use and at what
          level. Drag to spin it.
        </p>
      )}
      <ul className="prism-legend">
        <li>
          <i className="dot dot-teal" /> Advanced &amp; intermediate
        </li>
        <li>
          <i className="dot dot-crimson" /> Beginner
        </li>
        <li>Size = time spent</li>
      </ul>
    </ActSection>
  );
}

/* ----------------------------------------------------------------- 04 skills */

const readTurbine = () => turbineState.index;

export function SkillsCopy({ profile }: { profile: Profile }) {
  const index = usePolled(readTurbine);
  const skill = profile.skills[Math.min(index, profile.skills.length - 1)];
  if (!skill) return null;
  return (
    <ActSection id="skills" eyebrow={`${index + 1} of ${profile.skills.length}`} title="Skills">
      <div className="prism-detail">
        <h3 className="prism-detail-title">{skill.name}</h3>
        <p className="prism-detail-meta">
          <span className="prism-figure">{skill.percentage}%</span> · {skill.duration} months
        </p>
        <p className="prism-text prism-text-short">{skill.description}</p>
        <div
          className="prism-bar"
          role="meter"
          aria-valuenow={Number(skill.percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={skill.name}
        >
          <i style={{ width: `${skill.percentage}%` }} />
        </div>
      </div>
    </ActSection>
  );
}

/* ----------------------------------------------------------- 05 achievements */

const readCert = () => constellationState.hovered;

export function AchievementsCopy({ profile }: { profile: Profile }) {
  const stage = useStageState();
  const hovered = usePolled(readCert);
  const index = hovered >= 0 ? hovered : stage.achievement;
  const item = index >= 0 ? profile.achievements[index] : null;

  return (
    <ActSection
      id="achievements"
      eyebrow={`${profile.achievements.length} certifications`}
      title="Achievements"
    >
      {item ? (
        <div className="prism-detail">
          <h3 className="prism-detail-title">{item.name}</h3>
          <p className="prism-detail-meta">
            {item.level} ·{' '}
            {new Date(item.certification_date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
            })}
          </p>
          <p className="prism-text prism-text-short">{item.description}</p>
          <div className="prism-actions">
            <a
              className="prism-btn prism-btn-solid"
              href={item.certification_url}
              target="_blank"
              rel="noreferrer"
            >
              View certificate
            </a>
          </div>
        </div>
      ) : (
        <>
          <p className="prism-text prism-text-short">
            Position is the date it was earned; distance from the centre is the level, so the
            shape of the constellation is the trajectory.
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
    </ActSection>
  );
}

/* ------------------------------------------------------------------ 06 works */

const readWorks = () => worksState.index;
const readWorksExpanded = () => worksState.expanded;

export function WorksCopy({ profile }: { profile: Profile }) {
  const stage = useStageState();
  const index = usePolled(readWorks);
  const expanded = usePolled(readWorksExpanded);
  const ordered = useMemo(() => orderProjects(profile.projects), [profile.projects]);
  const shown = expanded ? ordered.length : Math.min(5, ordered.length);
  const project = ordered[Math.min(index, shown - 1)];
  if (!project) return null;

  const tech = String(project.tech_stack || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  return (
    <ActSection id="works" eyebrow={`Works · ${index + 1} / ${shown}`} title={project.name}>
      <p className="prism-detail-meta">
        {project.work_role} · {project.type} · {project.stack}
      </p>
      {/* `details` is authored as HTML in profile.json, exactly as the flat site renders it. */}
      <p className="prism-text" dangerouslySetInnerHTML={{ __html: project.details }} />
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
        <button
          type="button"
          className="prism-btn"
          onClick={() => {
            worksState.expanded = !worksState.expanded;
          }}
        >
          {expanded ? 'Recent 5 only' : `View all ${ordered.length} projects`}
        </button>
        {project.live_url && (
          <a className="prism-btn" href={project.live_url} target="_blank" rel="noreferrer">
            {project.live_text || 'Live'}
          </a>
        )}
      </div>
    </ActSection>
  );
}

/* ---------------------------------------------------------------- 07 hobbies */

const readGalleryHover = () => galleryState.hovered;
const readGalleryExpanded = () => galleryState.expanded;

export function HobbiesCopy({ profile }: { profile: Profile }) {
  const stage = useStageState();
  const hovered = usePolled(readGalleryHover);
  const expanded = usePolled(readGalleryExpanded);
  const item = hovered >= 0 ? profile.gallery[hovered] : null;
  const shown = expanded ? profile.gallery.length : Math.min(6, profile.gallery.length);
  const categories = useMemo(
    () => [...new Set(profile.gallery.map((g) => g.category))].sort(),
    [profile.gallery]
  );

  return (
    <ActSection
      id="hobbies"
      eyebrow={item ? item.category : 'Beyond the code'}
      title={item ? item.name : 'Hobbies'}
    >
      {item ? (
        <>
          <p className="prism-text prism-text-short">{item.description}</p>
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
          <p className="prism-text prism-text-short">{profile.info.about_text}</p>
          <p className="prism-chips">
            {categories.map((category) => (
              <span key={category} className="prism-chip">
                {category}
              </span>
            ))}
          </p>
        </>
      )}
      <div className="prism-actions">
        <button
          type="button"
          className="prism-btn"
          onClick={() => {
            galleryState.expanded = !galleryState.expanded;
          }}
        >
          {expanded
            ? `Showing all ${profile.gallery.length}`
            : `Explore all ${profile.gallery.length} works`}
        </button>
      </div>
      {/* Hover is how this act is meant to be read, but touch has no hover — so the
          works are listed too. Same content, same lightbox, reachable by tap. */}
      <ul className="prism-inline-list">
        {profile.gallery.slice(0, shown).map((work, i) => (
          <li key={work.gallery_item_id}>
            <button type="button" onClick={() => stage.setLightbox(i)}>
              {work.name}
            </button>
          </li>
        ))}
      </ul>
    </ActSection>
  );
}

/* ----------------------------------------------------------------- 08 arcade */

const readArcadeLoaded = () => arcadeState.loaded;

export function ArcadeCopy() {
  const loaded = usePolled(readArcadeLoaded);
  return (
    <ActSection id="arcade" eyebrow="Run Fz Run" title="Gaming">
      <p className="prism-text prism-text-short">
        Clips from the channel, on a curved wall. Tap one to play it here.
      </p>
      <p className="prism-detail-meta">
        {loaded > 0 ? `${loaded} clips on the wall` : 'Loading the wall…'}
      </p>
      <div className="prism-actions">
        <a
          className="prism-btn prism-btn-solid"
          href="https://www.youtube.com/@runfzrun"
          target="_blank"
          rel="noreferrer"
        >
          Open the channel
        </a>
      </div>
    </ActSection>
  );
}
