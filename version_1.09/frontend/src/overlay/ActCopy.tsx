import { useMemo } from 'react';
import { orderProjects } from '../stage/data';
import {
  arcadeState,
  cloudState,
  constellationState,
  galleryState,
  prismFocus,
  turbineState,
  worksState,
} from '../stage/liveState';
import { useStageState } from '../stage/StageState';
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
          Resume
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

/**
 * about_text is authored in the admin editor and arrives as HTML. The teaser wants
 * words, not markup, so tags come out and entities go back to characters.
 */
function plain(html: string): string {
  return String(html)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&(#39|apos);/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Act 02 draws nothing.
 *
 * Every institute, role, date and description flies past in the corridor itself, so a
 * panel repeating them was the overlay competing with the act it exists to introduce —
 * and the button that replaced the panel was parked in the middle of the screen, in
 * the one part of the frame the corridor needs kept clear. It now lives in the
 * masthead row beside SyncBot (see PrismMasthead), where the world already keeps the
 * things you can click.
 *
 * What stays here is the record: the eyebrow, the heading and the whole of about_text
 * are still in the document for search and for screen readers. They are simply not
 * drawn.
 */
export function BackgroundCopy({ profile }: { profile: Profile }) {
  const { info } = profile;
  const teaser = useMemo(() => plain(info.about_text), [info.about_text]);

  return (
    <ActSection
      id="background"
      eyebrow="Where this came from"
      title="Background"
      titleHidden
      className="prism-act-quiet"
      drift={0}
    >
      <p className="prism-sr">{teaser}</p>
    </ActSection>
  );
}

/* -------------------------------------------------------------- 03 expertise */

const readCloudHover = () => cloudState.hovered;

/**
 * Act 03's HUD — one line, above the readout, and nothing else.
 *
 * The bottom-left panel is gone: a hint telling you to hover the sphere, a legend for
 * two colours, and a heading repeating the readout, all stacked over the corner of the
 * cloud they described. So is the centred detail card that briefly replaced it — the
 * word you are pointing at is already lit and enlarged on the sphere, so restating its
 * name in a panel over the top of it was the same information twice. The one thing the
 * sphere cannot tell you is how long, so that is all this line says.
 *
 * Hover and tap write the same field (see src/stage/acts/act03Cloud.ts), which is
 * why a tap on empty space puts the headline straight back.
 *
 * The heading and the full list of technologies stay in the document for search and
 * for a screen reader; they are simply not drawn.
 */
export function ExpertiseCopy({ profile }: { profile: Profile }) {
  const hovered = usePolled(readCloudHover);
  const item = hovered >= 0 ? profile.expertises[hovered] : null;
  // A floor, not an inventory: "22+" against 23 rows, so the claim stays true the day
  // a row is added or removed in the admin editor.
  const floor = Math.max(1, profile.expertises.length - 1);

  return (
    <ActSection
      id="expertise"
      eyebrow={`${profile.expertises.length} technologies`}
      title="Expertise"
      titleHidden
      className="prism-act-hud"
      drift={0}
    >
      <ul className="prism-sr">
        {profile.expertises.map((tech) => (
          <li key={tech.expertise_id}>
            {tech.name} — {tech.level}, {tech.duration} months
          </li>
        ))}
      </ul>

      <p className="prism-cloud-total" role="status" aria-live="polite">
        {item ? (
          <>
            {/* On screen the sphere supplies the name; a screen reader has no sphere. */}
            <span className="prism-sr">{item.name}: </span>
            {item.duration} months
          </>
        ) : (
          `${floor}+ technologies`
        )}
      </p>
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
