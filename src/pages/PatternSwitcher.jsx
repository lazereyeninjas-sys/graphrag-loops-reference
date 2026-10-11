// Page 2 tab switcher over the loop patterns, in PATTERNS order.
// Props: patterns (Pattern[]), activeId (pattern id from the route).
// Activating a tab sets #/patterns/:id. Left/Right (and Home/End) move focus between
// tabs; Enter or Space activates the focused tab. Unknown ids fall back to drift.
// A de-emphasised pattern (critique) gets a muted tab and a trailing badge whose text
// comes from pattern.badge (B4_BADGE); it never gets the primary accent.
// Tab titles and badge text come from validated data; rendered as text nodes only (S9).
import { useRef } from 'react';
import { navigate, patternHash, DEFAULT_PATTERN_ID } from '../hooks/useHashRoute.js';

export const PATTERN_PANEL_ID = 'pattern-panel';
export const patternTabId = (id) => `pattern-tab-${id}`;

export default function PatternSwitcher({ patterns, activeId }) {
  const list = Array.isArray(patterns) ? patterns : [];
  const tabRefs = useRef({});
  const known = list.some((p) => p.id === activeId);
  const current = known ? activeId : DEFAULT_PATTERN_ID;

  const focusAt = (index) => {
    const p = list[(index + list.length) % list.length];
    const el = p ? tabRefs.current[p.id] : null;
    if (el) el.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); focusAt(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); focusAt(index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusAt(0); }
    else if (e.key === 'End') { e.preventDefault(); focusAt(list.length - 1); }
  };

  if (list.length === 0) return null;

  return (
    <div className="pattern-switcher" role="tablist" aria-label="Loop patterns">
      {list.map((p, index) => {
        const active = p.id === current;
        const cls = [
          'pattern-tab',
          active ? 'pattern-tab--active' : '',
          p.deemphasised ? 'pattern-tab--muted' : '',
        ].filter(Boolean).join(' ');
        return (
          <button
            key={p.id}
            ref={(el) => { tabRefs.current[p.id] = el; }}
            type="button"
            role="tab"
            id={patternTabId(p.id)}
            className={cls}
            aria-selected={active}
            aria-controls={PATTERN_PANEL_ID}
            tabIndex={active ? 0 : -1}
            data-pattern-id={p.id}
            onClick={() => navigate(patternHash(p.id))}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <span className="pattern-tab-title">{p.title}</span>
            {p.badge && p.badge.text ? (
              <span className="pattern-tab-badge label-badge label-badge--warning">
                {p.badge.text}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
