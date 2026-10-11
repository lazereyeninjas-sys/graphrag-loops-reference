// The only path for factual text on any page (STANDARDS S1).
// Renders: claim text, then " \u2014 " and the source names joined by "; ",
// then a LabelBadge when the claim has a label.
// An info toggle reveals the source URLs as <code> text. URLs are never links,
// never fetched, and never used as href, src or srcset (S8).
// All text renders as React text nodes; no HTML injection sinks (S9).
// Unknown source ids: the data validators throw at module load, so invalid
// content cannot mount. As a second guard, a claim with any unknown id
// renders nothing here.
import { useId, useState } from 'react';
import { SOURCES } from '../data/sources.js';
import LabelBadge from './LabelBadge.jsx';

function isRenderable(claim) {
  if (!claim || typeof claim.text !== 'string' || !claim.text.trim()) return false;
  if (!Array.isArray(claim.sourceIds) || claim.sourceIds.length < 1) return false;
  return claim.sourceIds.every((id) => Object.prototype.hasOwnProperty.call(SOURCES, id));
}

export default function ClaimText({ claim }) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  if (!isRenderable(claim)) return null;

  const sources = claim.sourceIds.map((id) => SOURCES[id]);
  const names = sources.map((s) => s.name).join('; ');

  return (
    <span className="claim">
      <span className="claim-text">{claim.text}</span>
      <span className="claim-sources">
        {' \u2014 '}
        {names}
      </span>
      {claim.label ? (
        <>
          {' '}
          <LabelBadge label={claim.label} />
        </>
      ) : null}
      {' '}
      <button
        type="button"
        className="claim-info-toggle"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={open ? 'Hide source addresses' : 'Show source addresses'}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {open ? 'hide sources' : 'sources'}
      </button>
      {open ? (
        <span id={listId} className="claim-urls">
          {sources.map((s) => (
            <span key={s.id} className="claim-url">
              <span className="claim-url-name">{s.name}</span>
              {': '}
              <code>{s.url}</code>
            </span>
          ))}
        </span>
      ) : null}
    </span>
  );
}
