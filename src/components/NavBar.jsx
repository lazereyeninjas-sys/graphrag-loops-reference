// Top navigation: three hash-only links built from the ROUTES enum (S8).
// Props: route ({ page, patternId, hash }) from useHashRoute.
// The active link carries aria-current="page". No link leaves the app:
// every href starts with #/ and comes from the route enum, never from data.
// Chrome text only: nav labels come from ROUTES; no factual text here (S1).
import { ROUTES, PAGES, patternHash } from '../hooks/useHashRoute.js';

// Only internal hash routes are ever rendered as an href.
function safeHash(hash) {
  return typeof hash === 'string' && hash.startsWith('#/') ? hash : '#/anatomy';
}

// The patterns link keeps the currently selected pattern when already on that page.
function linkHash(entry, route) {
  if (entry.page === PAGES.PATTERNS && route && route.page === PAGES.PATTERNS && route.patternId) {
    return patternHash(route.patternId);
  }
  return entry.hash;
}

export default function NavBar({ route }) {
  const activePage = route && route.page ? route.page : PAGES.ANATOMY;

  return (
    <header className="nav-header">
      <nav className="nav-bar" aria-label="Pages">
        <span className="nav-title">GraphRAG loops reference</span>
        <ul className="nav-list">
          {ROUTES.map((entry) => {
            const active = entry.page === activePage;
            return (
              <li key={entry.page} className="nav-item">
                <a
                  className={`nav-link${active ? ' nav-link--active' : ''}`}
                  href={safeHash(linkHash(entry, route))}
                  aria-current={active ? 'page' : undefined}
                >
                  {entry.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
