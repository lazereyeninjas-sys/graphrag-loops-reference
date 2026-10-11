// Page 3 (When to use): framing findings, a static query-type gate placed before any loop,
// and one expandable card per use case in USE_CASES order.
// Props: route (unused; accepted for a consistent page signature).
// Framing claims render as lead paragraphs via ClaimText; headings are chrome (S1).
// Motion on this page comes from card expand/collapse and selection transitions (S12).
import { FRAMING, GATE, USE_CASES } from '../data/whenToUse/index.js';
import ClaimText from '../components/ClaimText.jsx';
import QueryGate from './QueryGate.jsx';
import UseCaseCard from './UseCaseCard.jsx';

export default function WhenToUsePage() {
  const framing = Array.isArray(FRAMING) ? FRAMING : [];
  const useCases = Array.isArray(USE_CASES) ? USE_CASES : [];

  return (
    <div className="page page--when">
      <header className="page-header">
        <h1>When to use</h1>
      </header>

      <section className="framing" aria-label="Framing: RAG and GraphRAG in general">
        <h2 className="framing-heading">Framing</h2>
        {framing.map((claim, i) => (
          <p key={i} className="framing-lead">
            <ClaimText claim={claim} />
          </p>
        ))}
      </section>

      <QueryGate gate={GATE} />

      <section className="use-cases" aria-label="Use-case guide per loop pattern">
        <h2 className="use-cases-heading">Use-case guide</h2>
        <p className="use-cases-hint">Open a card to see best fit, weak spots and the Agent Command suggestion.</p>
        <div className="use-case-grid">
          {useCases.map((u) => (
            <UseCaseCard key={u.patternId} useCase={u} />
          ))}
        </div>
      </section>
    </div>
  );
}
