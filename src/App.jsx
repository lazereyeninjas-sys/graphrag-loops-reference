// App shell: reads the hash route, renders NavBar plus exactly one page.
// On a route change, focus moves to the new page's h1 (UI.md S0).
// No factual text here: only chrome. All content reaches the screen via ClaimText.
import { useEffect, useRef } from 'react';
import { useHashRoute, PAGES } from './hooks/useHashRoute.js';
import NavBar from './components/NavBar.jsx';
import AnatomyPage from './pages/AnatomyPage.jsx';
import PatternsPage from './pages/PatternsPage.jsx';
import WhenToUsePage from './pages/WhenToUsePage.jsx';
import './styles/base.css';
import './styles/flow.css';
import './styles/pages.css';

// Moves keyboard focus to the first h1 inside the main region.
function focusHeading(mainEl) {
  if (!mainEl) return;
  const heading = mainEl.querySelector('h1');
  if (!heading) return;
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: false });
}

function renderPage(route) {
  if (route.page === PAGES.PATTERNS) {
    return (
      <PatternsPage
        route={route}
        patternId={route.patternId}
        activeId={route.patternId}
      />
    );
  }
  if (route.page === PAGES.WHEN) {
    return <WhenToUsePage route={route} />;
  }
  return <AnatomyPage route={route} />;
}

export default function App() {
  const route = useHashRoute();
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  // Focus the page heading after navigation, but not on the first load.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    focusHeading(mainRef.current);
  }, [route.page, route.patternId]);

  return (
    <div className="app">
      <NavBar route={route} />
      <main ref={mainRef} className="app-main" id="main">
        {renderPage(route)}
      </main>
    </div>
  );
}
