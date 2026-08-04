import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { BackToTop } from '../../components/BackToTop/BackToTop';
import { Footer } from '../../components/Footer/Footer';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageShell } from '../../components/PageShell/PageShell';
import { ProjectDetails } from '../../components/ProjectDetails/ProjectDetails';
import { ThemePopup } from '../../components/ThemePopup/ThemePopup';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePageReveal } from '../../hooks/usePageReveal';
import { isFirstVisit } from '../../lib/theme';

export function WorkPage() {
  const profile = useProfile();
  const [searchParams] = useSearchParams();
  const workId = searchParams.get('work_id');
  const numericId = Number(workId);
  const valid =
    workId !== null && workId !== '' && !isNaN(numericId) && numericId > 0 && numericId <= profile.projects.length;
  const work = valid ? profile.projects[numericId - 1] : undefined;

  const ready = usePageReveal('work_details', { enabled: valid, workTitle: work?.name });
  const [firstVisit] = useState(isFirstVisit);

  useDocumentTitle(work ? 'Work - ' + work.name : undefined);

  if (!valid || !work) {
    console.error('Invalid or missing work_id in the query parameter. Redirecting to /404');
    return <Navigate to="/404" replace />;
  }

  return (
    <PageShell ready={ready} overlays={<BackToTop />}>
      <Navbar />
      <ThemePopup visible={firstVisit} />
      <div className="main-content">
        <section className="nav-section" id="work_page">
          <div id="content-gap" style={{ border: 'none' }}></div>
          <div className="row">
            <div className="section-head wobble c1" id="work-title">
              {work.name}
            </div>
          </div>
          <div className="row">
            <div className="wobble c3" data-animation="upscale" id="work-role">
              {work.work_role}
            </div>
          </div>
          <ProjectDetails project={work} />
        </section>
        <br />
        <br />
        <br />
        <Footer variant="page" />
      </div>
    </PageShell>
  );
}
