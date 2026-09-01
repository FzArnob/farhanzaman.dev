import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { PreLoader } from './components/PreLoader/PreLoader';
import { ProfileContext } from './data/ProfileContext';
import { loadProfile } from './data/loadProfile';
import { ForbiddenPage, NotFoundPage, ServerErrorPage } from './pages/Error/ErrorPage';
import { PrismPage } from './pages/Prism/PrismPage';
import type { Profile } from './types/profile';

/**
 * The 2D pages are v1.09's fallback rather than its main path, so they are code-split:
 * a visitor who gets the 3D world should not download the flat site as well. Error
 * pages stay eager — they have to render when something has already gone wrong.
 */
const HomePage = lazy(() => import('./pages/Home/HomePage').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./pages/About/AboutPage').then((m) => ({ default: m.AboutPage })));
const ExpertisePage = lazy(() =>
  import('./pages/Expertise/ExpertisePage').then((m) => ({ default: m.ExpertisePage }))
);
const WorksPage = lazy(() => import('./pages/Works/WorksPage').then((m) => ({ default: m.WorksPage })));
const WorkPage = lazy(() => import('./pages/Work/WorkPage').then((m) => ({ default: m.WorkPage })));
const HobbiesPage = lazy(() =>
  import('./pages/Hobbies/HobbiesPage').then((m) => ({ default: m.HobbiesPage }))
);
const GamingPage = lazy(() => import('./pages/Gaming/GamingPage').then((m) => ({ default: m.GamingPage })));
const SyncBotPage = lazy(() => import('./pages/SyncBot/SyncBotPage').then((m) => ({ default: m.SyncBotPage })));

/**
 * Each route was its own document before, so every navigation starts at the top.
 * The Prism routes are excluded: there the camera flies to the act's `t` instead,
 * and resetting the scroll would cancel that flight.
 */
const PRISM_PATHS = new Set([
  '/',
  '/about',
  '/expertise',
  '/skills',
  '/works',
  '/achievements',
  '/hobbies',
  '/contact',
]);

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (PRISM_PATHS.has(pathname)) return;
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

export function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    loadProfile()
      .then(setProfile)
      .catch((error) => console.error('Failed to load profile data:', error));
  }, []);

  if (!profile) {
    const loaderImage =
      pathname === '/gaming' ? '/view/static/runfzrun.png' : '/view/static/favicon.svg';
    return <PreLoader image={loaderImage} />;
  }

  return (
    <ProfileContext.Provider value={profile}>
      <ScrollToTop />
      <Suspense fallback={<PreLoader image="/view/static/favicon.svg" />}>
      <Routes>
        {/*
          v1.09: the site is one continuous 3D world. Every one of these paths
          resolves to a position on that one scroll (see three/timeline.ts) and the
          camera flies there, so existing links, bookmarks and indexed URLs keep
          working without a cut. The flat pages below remain the fallback and are
          what PrismPage renders in flat mode.
        */}
        <Route path="/" element={<PrismPage />} />
        <Route path="/about" element={<PrismPage />} />
        <Route path="/expertise" element={<PrismPage />} />
        <Route path="/skills" element={<PrismPage />} />
        <Route path="/works" element={<PrismPage />} />
        <Route path="/achievements" element={<PrismPage />} />
        <Route path="/hobbies" element={<PrismPage />} />
        <Route path="/contact" element={<PrismPage />} />

        {/* The 2D site, still reachable in full. */}
        <Route path="/flat" element={<HomePage />} />
        <Route path="/flat/about" element={<AboutPage />} />
        <Route path="/flat/expertise" element={<ExpertisePage />} />
        <Route path="/flat/works" element={<WorksPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/flat/hobbies" element={<HobbiesPage />} />
        <Route path="/gaming" element={<GamingPage />} />
        <Route path="/syncbot" element={<SyncBotPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </ProfileContext.Provider>
  );
}
