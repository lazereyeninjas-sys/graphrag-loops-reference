// Page 3 card for one use case: best fit, weak spots (or EMPTY_WEAK), optional general
// findings, and the Agent Command suggestion with its always-shown suggestion badge.
// Props: useCase ({ patternId, bestFit, weakSpots, generalFindings?, suggestion }).
// Headings come from a local chrome title map; factual text renders via ClaimText (S1).
// Collapsed: heading plus the first bestFit claim. Expanded: every section (aria-expanded).
import { useId, useState } from 'react';
import ClaimText from '../components/ClaimText.jsx';
import LabelBadge from '../components/LabelBadge.jsx';
import { EMPTY_WEAK, SUGGESTION_KIND } from '../data/labels.js';

const TITLES = Object.freeze({
  drift: 'DRIFT search',
  'multihop-tog': 'Iterative multi-hop: ToG mechanism',
  'multihop-findings': 'Iterative multi-hop: general findings',
  update: 'Incremental update from new documents',
  critique: 'Critique-and-retry (Text2Cypher)',
  global: 'Global map-reduce (single pass)',
});

// Suggestion shown via ClaimText with its basis sources named; badge added separately.
const asClaim = (s) => ({ text: s.text, sourceIds: s.basisSourceIds, label: null });

function ClaimList({ claims }) {
  return (
    <ul className="use-case-claims">
      {claims.map((claim, i) => <li key={i} className="use-case-claim"><ClaimText claim={claim} /></li>)}
    </ul>
  );
}

export default function UseCaseCard({ useCase }) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  if (!useCase) return null;
  const bestFit = Array.isArray(useCase.bestFit) ? useCase.bestFit : [];
  const weak = Array.isArray(useCase.weakSpots) ? useCase.weakSpots : [];
  const general = Array.isArray(useCase.generalFindings) ? useCase.generalFindings : [];
  const s = useCase.suggestion;
  const muted = useCase.patternId === 'critique' ? ' use-case-card--muted' : '';
  const cls = `use-case-card${muted}${open ? ' use-case-card--open' : ''}`;

  return (
    <article className={cls} data-pattern-id={useCase.patternId}>
      <h2 className="use-case-heading">
        <button type="button" className="use-case-toggle" aria-expanded={open}
          aria-controls={bodyId} onClick={() => setOpen((v) => !v)}>
          <span className="use-case-title">{TITLES[useCase.patternId] || useCase.patternId}</span>
          <span className="use-case-toggle-hint" aria-hidden="true">{open ? '\u2212' : '+'}</span>
        </button>
      </h2>
      {!open && bestFit[0] ? (
        <p className="use-case-preview"><ClaimText claim={bestFit[0]} /></p>
      ) : null}
      <div id={bodyId} className={`use-case-body${open ? ' use-case-body--open' : ''}`}>
        {open ? (
          <>
            <h3 className="use-case-section-heading">Best fit</h3>
            <ClaimList claims={bestFit} />
            <h3 className="use-case-section-heading">Weak spots</h3>
            {weak.length > 0 ? <ClaimList claims={weak} /> : <p className="use-case-empty">{EMPTY_WEAK}</p>}
            {general.length > 0 ? (
              <>
                <h3 className="use-case-section-heading">General findings</h3>
                <ClaimList claims={general} />
              </>
            ) : null}
            <h3 className="use-case-section-heading">Suggested for Agent Command loop builds</h3>
            {s && s.kind === SUGGESTION_KIND ? (
              <p className="use-case-suggestion">
                <LabelBadge label={SUGGESTION_KIND} />{' '}<ClaimText claim={asClaim(s)} />
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}
