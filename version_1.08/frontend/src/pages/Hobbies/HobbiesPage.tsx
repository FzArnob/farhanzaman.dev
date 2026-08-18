import { useState } from 'react';
import { BackToTop } from '../../components/BackToTop/BackToTop';
import { Footer } from '../../components/Footer/Footer';
import { Gallery } from '../../components/Gallery/Gallery';
import { Navbar } from '../../components/Navbar/Navbar';
import { PageShell } from '../../components/PageShell/PageShell';
import { SectionHead } from '../../components/SectionHead/SectionHead';
import { PhotoViewer } from '../../components/PhotoViewer/PhotoViewer';
import { ThemePopup } from '../../components/ThemePopup/ThemePopup';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePageReveal } from '../../hooks/usePageReveal';
import type { Rect } from '../../lib/motion/flip';
import { isFirstVisit } from '../../lib/theme';

export function HobbiesPage() {
  const profile = useProfile();
  const { info } = profile;
  const ready = usePageReveal('hobbies');
  const [firstVisit] = useState(isFirstVisit);
  const [photo, setPhoto] = useState<{ index: number; rect: Rect | null } | null>(null);

  useDocumentTitle('Hobbies - ' + info.full_name);

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
      <Navbar active="hobbies" />
      <ThemePopup visible={firstVisit} />
      <div className="main-content">
        <section className="nav-section">
          <div className="content-gap" style={{ border: 'none' }}></div>
          <SectionHead
            index="01"
            title="Hobbies"
            meta={`${profile.gallery.length} pieces · ${new Set(profile.gallery.map((item) => item.category)).size} categories`}
          />
          <Gallery
            gallery={profile.gallery}
            extended
            onOpen={(index, rect) => setPhoto({ index, rect })}
          />
        </section>
        <br />
        <br />
        <br />
        <Footer variant="page" />
      </div>
    </PageShell>
  );
}
