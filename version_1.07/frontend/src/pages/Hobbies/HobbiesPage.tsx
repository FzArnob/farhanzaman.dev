import { useState } from 'react';
import { BackToTop } from '../../components/BackToTop/BackToTop';
import { Footer } from '../../components/Footer/Footer';
import { Gallery } from '../../components/Gallery/Gallery';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageShell } from '../../components/PageShell/PageShell';
import { PhotoViewer } from '../../components/PhotoViewer/PhotoViewer';
import { ThemePopup } from '../../components/ThemePopup/ThemePopup';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePageReveal } from '../../hooks/usePageReveal';
import { isFirstVisit } from '../../lib/theme';

export function HobbiesPage() {
  const profile = useProfile();
  const { info } = profile;
  const ready = usePageReveal('hobbies');
  const [firstVisit] = useState(isFirstVisit);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  useDocumentTitle('Hobbies - ' + info.full_name);

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
      <Navbar active="hobbies" />
      <ThemePopup visible={firstVisit} />
      <div className="main-content">
        <section className="nav-section">
          <div id="content-gap" style={{ border: 'none' }}></div>
          <div className="row">
            <div className="section-head wobble">Hobbies</div>
          </div>
          <Gallery gallery={profile.gallery} extended onOpen={setPhotoIndex} />
        </section>
        <br />
        <br />
        <br />
        <Footer variant="page" />
      </div>
    </PageShell>
  );
}
