import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Achievements } from '../../components/Achievements/Achievements';
import { BackToTop } from '../../components/BackToTop/BackToTop';
import { ContactForm } from '../../components/ContactForm/ContactForm';
import { ContactInfo } from '../../components/ContactInfo/ContactInfo';
import { Footer } from '../../components/Footer/Footer';
import { Gallery } from '../../components/Gallery/Gallery';
import { IntroAnimation } from '../../components/Intro/IntroAnimation';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageShell } from '../../components/PageShell/PageShell';
import { PhotoViewer } from '../../components/PhotoViewer/PhotoViewer';
import { SectionHead } from '../../components/SectionHead/SectionHead';
import { SectionRail } from '../../components/SectionRail/SectionRail';
import { SkillBars } from '../../components/SkillBars/SkillBars';
import { SkillSphere } from '../../components/SkillSphere/SkillSphere';
import { SocialContact } from '../../components/SocialContact/SocialContact';
import { ThemePopup } from '../../components/ThemePopup/ThemePopup';
import { EducationList } from '../../components/Timeline/EducationList';
import { ExperienceList } from '../../components/Timeline/ExperienceList';
import { WorksMarquee } from '../../components/Works/WorksMarquee';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useInitialViewportHeight } from '../../hooks/useWindowSize';
import type { Rect } from '../../lib/motion/flip';
import { isFirstVisit } from '../../lib/theme';

const CONTACT_BACKGROUND =
  'url(https://live.staticflickr.com/65535/53222481427_250c18eb02_o.jpg)';

const RAIL = [
  { id: 'about-section', label: 'Background' },
  { id: 'expertise-section', label: 'Expertise' },
  { id: 'works-section', label: 'Works' },
  { id: 'gallery-section', label: 'Hobbies' },
  { id: 'contact-section', label: 'Contact' },
];

export function HomePage() {
  const profile = useProfile();
  const { info } = profile;
  const ready = usePageReveal('home');
  const viewportHeight = useInitialViewportHeight();
  const [firstVisit] = useState(isFirstVisit);
  const [photo, setPhoto] = useState<{ index: number; rect: Rect | null } | null>(null);

  useDocumentTitle(info.full_name);

  return (
    <PageShell
      ready={ready}
      hidden={photo !== null}
      overlays={
        <>
          <PhotoViewer
            gallery={profile.gallery}
            index={photo?.index ?? null}
            originRect={photo?.rect}
            onSelect={(index) => setPhoto({ index, rect: null })}
            onClose={() => setPhoto(null)}
          />
          <BackToTop />
        </>
      }
    >
      <Navbar hideHomeLink />
      <ThemePopup visible={firstVisit} />
      <SectionRail sections={RAIL} />
      <IntroAnimation info={info} />
      <div className="content-gap" style={{ marginTop: viewportHeight + 'px', border: 'none' }}></div>

      <div className="main-content">
        <section id="about-section" className="nav-section">
          <SectionHead
            index="01"
            title="Background"
            meta={`${profile.educations.length} degrees · ${profile.experiences.length} roles`}
          />
          <div className="row timeline-row">
            <EducationList educations={profile.educations} extended={false} />
            <ExperienceList experiences={profile.experiences} extended={false} />
          </div>
          <div className="row">
            <Link
              to="/about"
              id="about-me-btn"
              style={{
                zIndex: 10,
                marginLeft: '50%',
                transform: 'translate(-50%, 85px)',
                marginBottom: '40px',
              }}
              className="button button-a button-big button-rouded back-color"
            >
              About Me
            </Link>
          </div>
        </section>

        <section id="expertise-section" className="nav-section">
          <div className="content-gap"></div>
          <SectionHead
            index="02"
            title="Expertise"
            meta={`${profile.expertises.length} technologies · ${profile.skills.length} skills`}
          />
          <div className="row">
            <div className="column-2">
              <div className="expertize">
                <div
                  className="section-text"
                  id="expertise-text"
                  data-reveal="rise"
                  dangerouslySetInnerHTML={{ __html: info.expertise_preference_details }}
                ></div>
              </div>
              <SkillBars skills={profile.skills} extended={false} />
              <Link
                to="/expertise"
                id="expertise-more-btn"
                style={{
                  zIndex: 10,
                  marginLeft: '50%',
                  transform: 'translate(-50%,-50%)',
                  marginTop: '20px',
                }}
                className="button button-b button-big button-rouded back-color"
              >
                More
              </Link>
            </div>
            <div id="skill-canvas-container" className="column-2">
              <SkillSphere expertises={profile.expertises} />
            </div>
          </div>
          <Achievements achievements={profile.achievements} />
        </section>

        <section
          id="works-section"
          className="nav-section"
          style={{ maxWidth: '100%', overflowX: 'hidden' }}
        >
          <div className="content-gap"></div>
          <SectionHead index="03" title="Works" meta={`${profile.projects.length} projects`} />
          <WorksMarquee projects={profile.projects} />
          <div className="row">
            <Link
              to="/works"
              id="view-projects-btn"
              style={{ marginLeft: '50%', transform: 'translateX(-50%)', marginBottom: '40px' }}
              className="button button-a button-big button-rouded"
            >
              View Projects
            </Link>
          </div>
        </section>

        <section id="gallery-section" className="nav-section">
          <div className="content-gap"></div>
          <SectionHead index="04" title="Hobbies" meta={`${profile.gallery.length} pieces`} />
          <div className="row">
            <Gallery
              gallery={profile.gallery}
              extended={false}
              onOpen={(index, rect) => setPhoto({ index, rect })}
            />
          </div>
          <div className="row">
            <Link
              to="/hobbies"
              id="explore-hobbies-btn"
              style={{
                zIndex: 10,
                marginLeft: '50%',
                transform: 'translate(-50%,-51%)',
                marginBottom: '40px',
              }}
              className="button button-a button-big button-rouded back-color"
            >
              Explore
            </Link>
          </div>
        </section>

        <section
          id="contact-section"
          className="paralax-mf footer-paralax bg-image sect-mt4 route"
          style={{ backgroundImage: CONTACT_BACKGROUND }}
        >
          <div className="content-gap"></div>
          <SectionHead index="05" title="Contact" meta="direct line" />
          <div className="overlay-mf"></div>
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <div className="contact-mf">
                  <div id="contact" className="box-shadow-full bg2">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="title-box-2">
                          <h5 className="title-left" data-reveal="rise">
                            Send Direct Message
                          </h5>
                        </div>
                        <div>
                          <ContactForm />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="title-box-2 pt-4 pt-md-0">
                          <h5 className="title-left" data-reveal="rise">
                            Get in Touch
                          </h5>
                        </div>
                        <ContactInfo info={info} />
                        <SocialContact info={info} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer variant="overlay" />
        </section>
      </div>
    </PageShell>
  );
}
