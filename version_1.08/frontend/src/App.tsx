import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Cursor } from './components/Cursor/Cursor';
import { GlitchLoader } from './components/GlitchLoader/GlitchLoader';
import { useLoaderGate } from './components/GlitchLoader/useLoaderGate';
import { ParticleField } from './components/ParticleField/ParticleField';
import { ScrollProgress } from './components/ScrollProgress/ScrollProgress';
import { ProfileContext } from './data/ProfileContext';
import { loadProfile } from './data/loadProfile';
import { AboutPage } from './pages/About/AboutPage';
import { ForbiddenPage, NotFoundPage, ServerErrorPage } from './pages/Error/ErrorPage';
import { ExpertisePage } from './pages/Expertise/ExpertisePage';
import { GamingPage } from './pages/Gaming/GamingPage';
import { HobbiesPage } from './pages/Hobbies/HobbiesPage';
import { HomePage } from './pages/Home/HomePage';
import { SyncBotPage } from './pages/SyncBot/SyncBotPage';
import { WorkPage } from './pages/Work/WorkPage';
import { WorksPage } from './pages/Works/WorksPage';
import type { Profile } from './types/profile';

/** Each route was its own document before, so every navigation starts at the top. */
function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

/** `body[data-route]` lets CSS opt a route out of a global layer (SyncBot's own ambient). */
function useRouteFlag(pathname: string): string {
  const route = pathname.replace(/^\/+/, '') || 'home';
  useEffect(() => {
    document.body.dataset.route = route;
    return () => {
      delete document.body.dataset.route;
    };
  }, [route]);
  return route;
}

export function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { pathname } = useLocation();
  const route = useRouteFlag(pathname);

  // Gaming keeps its native cursors — pointer on links, caret in fields.
  const nativeCursorRoute = route === 'gaming';

  useEffect(() => {
    loadProfile()
      .then(setProfile)
      .catch((error) => console.error('Failed to load profile data:', error));
  }, []);

  const boot = useLoaderGate(profile !== null);

  return (
    <>
      <ParticleField />
      <Cursor enabled={!nativeCursorRoute} />
      <ScrollProgress />

      {!profile ? (
        boot.visible && (
          <GlitchLoader
            image={route === 'gaming' ? '/view/static/runfzrun.png' : undefined}
            exiting={boot.exiting}
          />
        )
      ) : (
        <ProfileContext.Provider value={profile}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/expertise" element={<ExpertisePage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/hobbies" element={<HobbiesPage />} />
            <Route path="/gaming" element={<GamingPage />} />
            <Route path="/syncbot" element={<SyncBotPage />} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ProfileContext.Provider>
      )}
    </>
  );
}
