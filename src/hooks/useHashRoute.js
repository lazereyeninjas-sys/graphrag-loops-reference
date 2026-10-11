// Hash-based routing with no router library.
// Routes: #/anatomy (default), #/patterns/:patternId (defaults to drift), #/when-to-use.
// Unknown hashes redirect to #/anatomy; unknown pattern ids redirect to drift.
// Links are hash-only, built from the ROUTES enum (S8).
import { useEffect, useState } from 'react';
import { PATTERN_IDS } from '../data/labels.js';

export const PAGES = Object.freeze({ ANATOMY: 'anatomy', PATTERNS: 'patterns', WHEN: 'when-to-use' });
export const DEFAULT_PATTERN_ID = 'drift';
export const DEFAULT_HASH = '#/anatomy';

// Builds the hash for one pattern; unknown ids fall back to the default pattern.
export function patternHash(id) {
  const safe = PATTERN_IDS.includes(id) ? id : DEFAULT_PATTERN_ID;
  return `#/patterns/${safe}`;
}

// Route enum used by NavBar to build its three hash links.
export const ROUTES = Object.freeze([
  Object.freeze({ page: PAGES.ANATOMY, label: 'Anatomy', hash: DEFAULT_HASH }),
  Object.freeze({ page: PAGES.PATTERNS, label: 'Loop patterns', hash: patternHash(DEFAULT_PATTERN_ID) }),
  Object.freeze({ page: PAGES.WHEN, label: 'When to use', hash: '#/when-to-use' }),
]);

// Parses a hash into { page, patternId, hash }, where hash is the canonical form.
export function parseHash(rawHash) {
  const hash = typeof rawHash === 'string' ? rawHash : '';
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === PAGES.PATTERNS) {
    const patternId = PATTERN_IDS.includes(parts[1]) ? parts[1] : DEFAULT_PATTERN_ID;
    return { page: PAGES.PATTERNS, patternId, hash: patternHash(patternId) };
  }
  if (parts[0] === PAGES.WHEN && parts.length === 1) {
    return { page: PAGES.WHEN, patternId: null, hash: '#/when-to-use' };
  }
  return { page: PAGES.ANATOMY, patternId: null, hash: DEFAULT_HASH };
}

function currentHash() {
  return typeof window === 'undefined' ? '' : window.location.hash;
}

// Replaces a non-canonical hash in place, without adding a history entry.
function canonicalise(route) {
  if (typeof window === 'undefined') return;
  if (window.location.hash !== route.hash) {
    window.history.replaceState(null, '', route.hash);
  }
}

// Navigates to a hash route; only hashes starting with #/ are accepted.
export function navigate(hash) {
  if (typeof window === 'undefined' || typeof hash !== 'string' || !hash.startsWith('#/')) return;
  window.location.hash = parseHash(hash).hash;
}

// Returns the current route and keeps it in sync with hashchange events.
export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(currentHash()));

  useEffect(() => {
    const sync = () => {
      const next = parseHash(currentHash());
      canonicalise(next);
      setRoute((prev) => (
        prev.page === next.page && prev.patternId === next.patternId ? prev : next
      ));
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return route;
}

export default useHashRoute;
