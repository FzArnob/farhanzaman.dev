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
import { SkillBars } from '../../components/SkillBars/SkillBars';
import { SkillCloud } from '../../components/SkillCloud/SkillCloud';
import { SocialContact } from '../../components/SocialContact/SocialContact';
import { ThemePopup } from '../../components/ThemePopup/ThemePopup';
import { EducationList } from '../../components/Timeline/EducationList';
import { ExperienceList } from '../../components/Timeline/ExperienceList';
import { WorksMarquee } from '../../components/Works/WorksMarquee';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useInitialViewportHeight } from '../../hooks/useWindowSize';
import { isFirstVisit } from '../../lib/theme';

const CONTACT_BACKGROUND =
  'url(https://live.staticflickr.com/65535/53222481427_250c18eb02_o.jpg)';

export function HomePage() {
  const profile = useProfile();
  const { info } = profile;
  const ready = usePageReveal('home');
  const viewportHeight = useInitialViewportHeight();
  const [firstVisit] = useState(isFirstVisit);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  useDocumentTitle(info.full_name);

  return (
    <PageShell
      ready={ready}
      hidden={photoIndex !== null}
      overlays={
        <>
          <PhotoViewer
            gallery={profile.gallery}
            index={photoIndex}
            onSelect={setPhotoIndex}
            onClose={() => setPhotoIndex(null)}
          />
          <BackToTop />
        </>
      }
    >
      <Navbar hideHomeLink />
      <ThemePopup visible={firstVisit} />
      <IntroAnimation info={info} />
      <div id="content-gap" style={{ marginTop: viewportHeight + 'px', border: 'none' }}></div>
      <div className="main-content">
        <section id="about-section" className="nav-section">
          <div className="row">
            <div className="section-head wobble">Background</div>
          </div>
          <div className="row">
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
          <div id="content-gap"></div>
          <div className="row">
            <div className="section-head wobble">Expertise</div>
          </div>
          <div className="row">
            <div className="column-2">
              <div className="expertize">
                <div
                  className="section-text"
                  id="expertise-text"
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
              <SkillCloud expertises={profile.expertises} />
            </div>
          </div>
          <Achievements achievements={profile.achievements} />
        </section>
        <section
          id="works-section"
          className="nav-section"
          style={{ maxWidth: '100%', overflowX: 'hidden' }}
        >
          <div id="content-gap"></div>
          <div className="row">
            <div className="section-head wobble">Works</div>
          </div>
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
          <div id="content-gap"></div>
          <div className="row">
            <div className="section-head wobble">Hobbies</div>
          </div>
          <div className="row">
            <Gallery gallery={profile.gallery} extended={false} onOpen={setPhotoIndex} />
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
          <div id="content-gap"></div>
          <div className="row">
            <div style={{ zIndex: 10 }} className="section-head wobble">
              Contact
            </div>
          </div>
          <div className="overlay-mf"></div>
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <div className="contact-mf">
                  <div id="contact" className="box-shadow-full bg2">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="title-box-2">
                          <h5 className="title-left">
                            <span className="wobble inline">Send </span>{' '}
                            <span className="wobble inline">Direct </span>{' '}
                            <span className="wobble inline">Message</span>
                          </h5>
                        </div>
                        <div>
                          <ContactForm />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="title-box-2 pt-4 pt-md-0">
                          <h5 className="title-left">
                            <span className="wobble inline">Get</span>{' '}
                            <span className="wobble inline">in</span>{' '}
                            <span className="wobble inline">Touch</span>
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
