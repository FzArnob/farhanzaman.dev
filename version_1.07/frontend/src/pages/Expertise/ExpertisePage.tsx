import { useState } from 'react';
import { Achievements } from '../../components/Achievements/Achievements';
import { BackToTop } from '../../components/BackToTop/BackToTop';
import { ExpertiseCards } from '../../components/ExpertiseCards/ExpertiseCards';
import { Footer } from '../../components/Footer/Footer';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageShell } from '../../components/PageShell/PageShell';
import { SkillBars } from '../../components/SkillBars/SkillBars';
import { ThemePopup } from '../../components/ThemePopup/ThemePopup';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePageReveal } from '../../hooks/usePageReveal';
import { isFirstVisit } from '../../lib/theme';

export function ExpertisePage() {
  const profile = useProfile();
  const { info } = profile;
  const ready = usePageReveal('expertise');
  const [firstVisit] = useState(isFirstVisit);

  useDocumentTitle('Expertise - ' + info.full_name);

  return (
    <PageShell ready={ready} overlays={<BackToTop />}>
      <Navbar active="expertise" />
      <ThemePopup visible={firstVisit} />
      <div id="content-gap" style={{ border: 'none' }}></div>
      <div className="main-content">
        <section id="expertise-section" className="nav-section">
          <br />
          <br />
          <br />
          <div className="row">
            <div className="section-head wobble">Expertise</div>
          </div>
          <div className="row">
            <div className="expertize-full">
              <div
                className="section-text"
                id="expertise-text"
                dangerouslySetInnerHTML={{ __html: info.expertise_preference_details }}
              ></div>
            </div>
            <SkillBars skills={profile.skills} extended />
          </div>
          <ExpertiseCards expertises={profile.expertises} />
          <Achievements achievements={profile.achievements} />
        </section>
        <br />
        <br />
        <br />
        <Footer variant="page" />
      </div>
    </PageShell>
  );
}
