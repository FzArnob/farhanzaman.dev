import { useState } from 'react';
import { BackToTop } from '../../components/BackToTop/BackToTop';
import { ContactForm } from '../../components/ContactForm/ContactForm';
import { Footer } from '../../components/Footer/Footer';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageShell } from '../../components/PageShell/PageShell';
import { SectionHead } from '../../components/SectionHead/SectionHead';
import { SectionRail } from '../../components/SectionRail/SectionRail';
import { SocialContact } from '../../components/SocialContact/SocialContact';
import { ThemePopup } from '../../components/ThemePopup/ThemePopup';
import { Qualification, combineAndLabel } from '../../components/Timeline/Qualification';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePageReveal } from '../../hooks/usePageReveal';
import { useInitialViewportHeight } from '../../hooks/useWindowSize';
import { isFirstVisit } from '../../lib/theme';

const CONTACT_BACKGROUND =
  'url(https://live.staticflickr.com/65535/53223738139_ab18a8886e_o.jpg)';

const RAIL = [
  { id: 'about-section', label: 'Qualifications' },
  { id: 'about-contact-section', label: 'Contact' },
];

export function AboutPage() {
  const profile = useProfile();
  const { info } = profile;
  const ready = usePageReveal('about');
  const viewportHeight = useInitialViewportHeight();
  const [firstVisit] = useState(isFirstVisit);

  useDocumentTitle('About - ' + info.full_name);

  return (
    <PageShell ready={ready} overlays={<BackToTop />}>
      <Navbar active="about" />
      <ThemePopup visible={firstVisit} />
      <SectionRail sections={RAIL} />
      <div className="main-content">
        <div className="about-top-container">
          <div className="about-top-section">
            <div className="mono-label about-kicker">{info.designations[0]}</div>
            <div
              className="about-title c1 decode decode-hover"
              data-reveal="decode"
              data-text="Get To Know Me"
            >
              Get To Know Me
            </div>
            <div
              className="about-description c1"
              id="about_text"
              data-reveal="rise"
              data-reveal-delay="120"
              dangerouslySetInnerHTML={{ __html: info.about_text }}
            ></div>
            <div className="about-contact">
              <div id="button-3">
                <div id="circle"></div>
                <a href="#about-contact-section">Contact Me</a>
              </div>
            </div>
            <div className="socials-cen">
              <SocialContact info={info} />
            </div>
          </div>
          <div className="about-image-back">
            <div className="about-image-border-effect-primary animate-top"></div>
            <div className="about-image-border-effect-secondary animate-left"></div>
            <div className="about-image bg2 animate-opacity"></div>
          </div>
          <div className="bottom-gradient" style={{ height: '200px' }}></div>
        </div>
        <div id="about-gap" style={{ marginTop: viewportHeight + 'px', border: 'none' }}></div>
        <section id="about-section" className="nav-section">
          <SectionHead
            index="01"
            title="Qualifications"
            meta={`${profile.educations.length} degrees · ${profile.experiences.length} roles`}
          />
          <Qualification items={combineAndLabel(profile.educations, profile.experiences)} />
          <br />
          <br />
        </section>
        <section
          id="about-contact-section"
          className="paralax-mf footer-paralax bg-image route"
          style={{ backgroundImage: CONTACT_BACKGROUND }}
        >
          <SectionHead index="02" title="Contact" meta="direct line" />
          <div className="overlay-mf"></div>
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <div className="contact-mf">
                  <div
                    id="contact"
                    className="box-shadow-full bg2"
                    style={{ maxWidth: '500px', margin: 'auto', marginBottom: '60px' }}
                  >
                    <div className="row">
                      <div className="col-md-12">
                        <div className="title-box-2">
                          <h5 className="title-left" data-reveal="rise">
                            Send Direct Message
                          </h5>
                        </div>
                        <div>
                          <ContactForm />
                        </div>
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
