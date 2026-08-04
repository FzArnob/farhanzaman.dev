import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { PreLoader } from './components/PreLoader/PreLoader';
import { ProfileContext } from './data/ProfileContext';
import { loadProfile } from './data/loadProfile';
import { AboutPage } from './pages/About/AboutPage';
import { ForbiddenPage, NotFoundPage, ServerErrorPage } from './pages/Error/ErrorPage';
import { ExpertisePage } from './pages/Expertise/ExpertisePage';
import { GamingPage } from './pages/Gaming/GamingPage';
import { HobbiesPage } from './pages/Hobbies/HobbiesPage';
import { HomePage } from './pages/Home/HomePage';
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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/expertise" element={<ExpertisePage />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/hobbies" element={<HobbiesPage />} />
        <Route path="/gaming" element={<GamingPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ProfileContext.Provider>
  );
}
