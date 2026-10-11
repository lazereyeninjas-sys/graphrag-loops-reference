// Page 3 query-type gate, placed before any loop. Static SVG (no FlowSpec, no dots).
// Props: gate ({ branches: [{ when: Claim, to: Claim }], suggestion: Suggestion }).
// SVG box labels are chrome; branch conditions, destinations and the suggestion
// render through ClaimText (S1). The suggestion badge is always shown (S5).
import ClaimText from '../components/ClaimText.jsx';
import LabelBadge from '../components/LabelBadge.jsx';
import { SUGGESTION_KIND } from '../data/labels.js';

const BOXES = [
  { id: 'q', x: 20, y: 70, text: 'Question' },
  { id: 'gate', x: 220, y: 70, text: 'Query-type gate' },
  { id: 'rag', x: 440, y: 15, text: 'Branch A' },
  { id: 'graph', x: 440, y: 125, text: 'Branch B' },
];
const LINKS = [
  'M 160 95 L 220 95',
  'M 360 85 Q 400 40 440 40',
  'M 360 105 Q 400 150 440 150',
];

// Suggestion shown via ClaimText, with its basis sources named; badge added separately.
const asClaim = (s) => ({ text: s.text, sourceIds: s.basisSourceIds, label: null });

export default function QueryGate({ gate }) {
  if (!gate || !Array.isArray(gate.branches)) return null;
  const s = gate.suggestion;
  return (
    <section className="query-gate" aria-labelledby="query-gate-heading">
      <h2 id="query-gate-heading" className="query-gate-heading">Query-type gate (before any loop)</h2>
      <svg className="query-gate-svg" viewBox="0 0 600 200" role="img"
        aria-label="A question passes a query-type gate and goes to branch A or branch B, described below">
        {LINKS.map((d, i) => (
          <path key={i} className="query-gate-link" d={d} fill="none" />
        ))}
        {BOXES.map((b) => (
          <g key={b.id} className={`query-gate-box query-gate-box--${b.id}`}
            transform={`translate(${b.x} ${b.y})`}>
            <rect width="140" height="50" rx="10" />
            <text x="70" y="25" textAnchor="middle" dominantBaseline="middle">{b.text}</text>
          </g>
        ))}
      </svg>
      <ol className="query-gate-branches">
        {gate.branches.map((b, i) => (
          <li key={i} className="query-gate-branch">
            <span className="query-gate-branch-name">{i === 0 ? 'Branch A' : 'Branch B'}</span>
            <p className="query-gate-when">
              <span className="query-gate-tag">When: </span>
              <ClaimText claim={b.when} />
            </p>
            <p className="query-gate-to">
              <span className="query-gate-tag">Route: </span>
              <ClaimText claim={b.to} />
            </p>
          </li>
        ))}
      </ol>
      {s && s.kind === SUGGESTION_KIND ? (
        <p className="query-gate-suggestion">
          <LabelBadge label={SUGGESTION_KIND} />{' '}
          <ClaimText claim={asClaim(s)} />
        </p>
      ) : null}
    </section>
  );
}
