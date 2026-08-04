import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { initTheme } from './lib/theme';
import './styles/index.css';

// The theme stylesheet is a separate <link>, applied before the first paint.
initTheme();

// StrictMode is deliberately omitted: the page relies on imperative one-shot effects
// (particle canvas, typed text, visitor tracking) that must not be double-invoked.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
