import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AboutBackdrop } from '../../components/About3D/AboutBackdrop';
import { PrismContactForm } from '../../components/ContactForm/PrismContactForm';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useScroll3D } from '../../hooks/useScroll3D';
import { synchronizePage } from '../../lib/sync';
import { PrismMark } from '../../overlay/PrismChrome';
import type { Education, Experience } from '../../types/profile';
import '../../styles/24-prism.css';
import '../../styles/25-about3d.css';

/**
 * /about — the Background act's About Me.
 *
 * The one path in v1.09 that is a document rather than a position on the scroll, and
 * deliberately so: act 02 flies you past the qualifications, and it cannot give you
 * the whole of about_text, every institute's description and a way to write to him at
 * the same time. This is where the reading happens.
 *
 * It was v1.07's page verbatim, which is why it read as broken — the flat site's
 * navbar, footer and bootstrap-ish form dropped into the middle of a world built out
 * of teal hairlines and dark glass. It is now the same design language as the world it
 * is reached from: the same tokens out of 24-prism.css, the same panels, and the
 * corridor from act 02 flattened into a page — a teal spine down the middle with the
 * education and the roles hung off either side of it, in the order you fly past them.
 *
 * Nothing was dropped in the move. Every field v1.07 showed is here: the full
 * about_text, both timelines with their descriptions and project links, the socials,
 * the résumé, the contact details and the direct-message form.
 *
 * Depth comes from useScroll3D — every block rides in from behind the screen as it
 * enters the viewport — and from the particle net behind the whole thing, so arriving
 * here reads as walking into a side room rather than leaving the site.
 */

interface Entry {
  key: string;
  kind: 'education' | 'experience';
  /** The big line: what he was doing. */
  role: string;
  institute: string;
  instituteUrl: string;
  period: string;
  detail: string;
  /** Named links out of a role's description — v1.07's project_text_1..3. */
  links: { text: string; url: string }[];
  present: boolean;
}

function period(start: string, end: string | null, present: string): string {
  const to = present === '1' ? 'Present' : end || '—';
  return start + ' → ' + to;
}

/**
 * Education and experience, interleaved — the same alternation v1.07's Qualification
 * component used, so the page still reads as one history rather than two lists.
 */
function combine(educations: Education[], experiences: Experience[]): Entry[] {
  const out: Entry[] = [];
  const most = Math.max(educations.length, experiences.length);

  for (let i = 0; i < most; i++) {
    const edu = educations[i];
    if (edu) {
      out.push({
        key: 'edu-' + edu.education_id,
        kind: 'education',
        role: edu.subject,
        institute: edu.institute_name,
        instituteUrl: edu.institute_url,
        period: period(edu.start_date, edu.end_date, edu.is_present),
        detail: edu.activity,
        links: [],
        present: edu.is_present === '1',
      });
    }
    const job = experiences[i];
    if (job) {
      out.push({
        key: 'exp-' + job.experience_id,
        kind: 'experience',
        role: job.position,
        institute: job.institute_name,
        instituteUrl: job.institute_url,
        period: period(job.start_date, job.end_date, job.is_present),
        detail: job.project_details,
        links: [
          [job.project_text_1, job.project_url_1],
          [job.project_text_2, job.project_url_2],
          [job.project_text_3, job.project_url_3],
          // A named project with no URL of its own falls back to the employer's.
        ].flatMap(([text, url]) => (text ? [{ text, url: url || job.institute_url }] : [])),
        present: job.is_present === '1',
      });
    }
  }
  return out;
}

export function AboutPage() {
  const profile = useProfile();
  const { info } = profile;

  useDocumentTitle('About - ' + info.full_name);
  useScroll3D(true);

  /*
    The page-view ping usePageReveal used to make. The reveal itself is gone with the
    pre-loader — this page has no fonts to wait on that 01-base.css has not already
    declared, and a second's blank screen off a button in the middle of the world was
    the worst part of the old handoff.
  */
  useEffect(() => synchronizePage('about'), []);

  const entries = useMemo(
    () => combine(profile.educations, profile.experiences),
    [profile.educations, profile.experiences]
  );

  return (
    <div className="about-world">
      <AboutBackdrop />

      {/* The world's own masthead. No navbar — the back button is the way out. */}
      <header className="prism-masthead about-masthead">
        <PrismMark nickName={info.nick_name} onClick={() => window.scrollTo({ top: 0 })} />
      </header>

      <main className="about-doc a3d-stage">
        <section className="about-hero">
          <div className="about-hero-copy">
            <p className="prism-eyebrow" data-a3d="hero">
              Get to know me
            </p>
            <h1 className="prism-head about-head" data-a3d="hero">
              {info.full_name}
            </h1>
            <p className="about-roles" data-a3d="hero">
              {info.designations.join('  ·  ')}
            </p>
            {/* about_text is authored as HTML in the admin editor, and every paragraph
                of it belongs here — this is the page act 02 sends you to for it. */}
            <div
              className="about-prose"
              data-a3d="rise"
              dangerouslySetInnerHTML={{ __html: info.about_text }}
            />
            <div className="prism-actions" data-a3d="rise">
              <a className="prism-btn prism-btn-solid" href="#about-contact">
                Contact me
              </a>
              <a className="prism-btn" href={info.resume_url} target="_blank" rel="noreferrer">
                Resume
              </a>
              <a className="prism-btn" href={info.github_url} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="prism-btn" href={info.linkedin_url} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a className="prism-btn" href={info.facebook_url} target="_blank" rel="noreferrer">
                Facebook
              </a>
              <a className="prism-btn" href={info.whatsapp_url} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
          </div>

          {/* v1.07's stacked frames, redrawn in the two brand colours. */}
          <div className="about-portrait" data-a3d="hero">
            <span className="about-portrait-frame about-portrait-teal" aria-hidden="true" />
            <span className="about-portrait-frame about-portrait-crimson" aria-hidden="true" />
            <img src={'/' + info.intro_image_url} alt="" loading="lazy" />
          </div>
        </section>

        <section className="about-track" id="about-qualifications">
          <p className="prism-eyebrow" data-a3d="rise">
            {profile.educations.length} degrees · {profile.experiences.length} roles
          </p>
          <h2 className="prism-head" data-a3d="rise">
            Qualifications
          </h2>

          {/* The corridor, flattened: one line, both histories hung off it. */}
          <ol className="about-spine">
            {entries.map((entry, i) => (
              <li
                key={entry.key}
                className={
                  'about-node about-node-' +
                  entry.kind +
                  (i % 2 ? ' about-node-right' : ' about-node-left')
                }
                data-a3d={i % 2 ? 'swingRight' : 'swingLeft'}
              >
                <span className="about-node-dot" aria-hidden="true" />
                <article className="about-card">
                  <h3 className="about-card-role">{entry.role}</h3>
                  <p className="about-card-where">
                    <a href={entry.instituteUrl} target="_blank" rel="noreferrer">
                      {entry.institute}
                    </a>
                  </p>
                  <p className="about-card-when">
                    {entry.period}
                    {entry.present && <i className="about-card-live" aria-hidden="true" />}
                  </p>
                  {entry.detail && <p className="about-card-detail">{entry.detail}</p>}
                  {entry.links.length > 0 && (
                    <p className="about-card-links">
                      {entry.links.map((link) => (
                        <a key={link.text} href={link.url} target="_blank" rel="noreferrer">
                          {link.text}
                        </a>
                      ))}
                    </p>
                  )}
                </article>
              </li>
            ))}
          </ol>
        </section>

        <section className="about-reach" id="about-contact">
          <p className="prism-eyebrow" data-a3d="rise">
            Contact
          </p>
          <h2 className="prism-head" data-a3d="rise">
            Send a direct message
          </h2>
          <p className="about-prose about-prose-tight" data-a3d="rise">
            {info.contact_preference_details}
          </p>

          <div className="prism-contact" data-a3d="rise">
            <a className="prism-address" href={'mailto:' + info.email}>
              {info.email}
            </a>
            <div className="prism-contact-grid">
              <p>
                <span>Phone</span>
                <a href={'tel:' + info.phone}>{info.phone}</a>
              </p>
              <p>
                <span>Also</span>
                <a href={'mailto:' + info.alternative_email}>{info.alternative_email}</a>
              </p>
              <p>
                <span>Where</span>
                {info.address}
              </p>
            </div>
          </div>

          <div className="about-form" data-a3d="rise">
            <PrismContactForm />
          </div>
        </section>

        <footer className="about-foot">
          <p>
            © {new Date().getFullYear()} {info.full_name} · {info.website_domain_name}
          </p>
        </footer>
      </main>

      {/* The way back into the world, since this page sits outside the scroll. */}
      <Link className="a3d-return" to="/">
        <i aria-hidden="true" />
        Back
      </Link>
    </div>
  );
}
