import { useState } from 'react';
import { BackToTop } from '../../components/BackToTop/BackToTop';
import { Footer } from '../../components/Footer/Footer';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageShell } from '../../components/PageShell/PageShell';
import { ThemePopup } from '../../components/ThemePopup/ThemePopup';
import { WorksGrid } from '../../components/Works/WorksGrid';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePageReveal } from '../../hooks/usePageReveal';
import { isFirstVisit } from '../../lib/theme';

export function WorksPage() {
  const profile = useProfile();
  const { info } = profile;
  const ready = usePageReveal('works');
  const [firstVisit] = useState(isFirstVisit);

  useDocumentTitle('Works - ' + info.full_name);

  return (
    <PageShell ready={ready} overlays={<BackToTop />}>
      <Navbar active="works" />
      <ThemePopup visible={firstVisit} />
      <div className="main-content">
        <section className="nav-section">
          <div id="content-gap" style={{ border: 'none' }}></div>
          <div className="row">
            <div className="section-head wobble">Projects</div>
          </div>
          <WorksGrid projects={profile.projects} />
        </section>
        <br />
        <br />
        <br />
        <Footer variant="page" />
      </div>
    </PageShell>
  );
}
