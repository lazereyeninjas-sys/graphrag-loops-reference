// Page 2 details for the active loop pattern. Props: pattern (a validated Pattern).
// Sections in fixed order: badge, graph source, what flows, trigger, resource cap and
// sufficiency stop (two separate rows, never merged), panels, overlap callout.
// Headings are chrome; all factual text renders through ClaimText (S1, S9).
import ClaimText from '../components/ClaimText.jsx';

function Section({ title, className = '', children }) {
  return (
    <section className={`pattern-section ${className}`.trim()}>
      <h3 className="pattern-section-heading">{title}</h3>
      {children}
    </section>
  );
}

function ClaimList({ claims }) {
  const list = Array.isArray(claims) ? claims : [];
  return (
    <ul className="pattern-claims">
      {list.map((claim, i) => <li key={i} className="pattern-claim"><ClaimText claim={claim} /></li>)}
    </ul>
  );
}

export default function PatternDetails({ pattern }) {
  if (!pattern) return null;
  const panels = Array.isArray(pattern.panels) ? pattern.panels : [];
  const cls = `pattern-details${pattern.deemphasised ? ' pattern-details--muted' : ''}`;

  return (
    <div className={cls} data-pattern-id={pattern.id}>
      <h2 className="pattern-details-title">{pattern.title}</h2>
      {pattern.badge ? (
        <p className="pattern-badge-row"><ClaimText claim={pattern.badge} /></p>
      ) : null}
      <Section title="Graph source" className="pattern-section--source">
        <p><ClaimText claim={pattern.graphSource} /></p>
      </Section>
      <Section title="What flows" className="pattern-section--flows">
        <ClaimList claims={pattern.flows} />
      </Section>
      <Section title="What triggers another pass" className="pattern-section--trigger">
        <p><ClaimText claim={pattern.trigger} /></p>
      </Section>
      <div className="pattern-limits">
        <Section title="Resource cap" className="pattern-row pattern-row--cap">
          <p><ClaimText claim={pattern.resourceCap} /></p>
        </Section>
        <Section title="Sufficiency stop" className="pattern-row pattern-row--stop">
          <p><ClaimText claim={pattern.sufficiencyStop} /></p>
        </Section>
      </div>
      {panels.length > 0 ? (
        <div className={`pattern-panels pattern-panels--${pattern.id}`}>
          {panels.map((panel, i) => (
            <section key={i} className="pattern-panel">
              <h3 className="pattern-panel-heading">{panel.heading}</h3>
              <ClaimList claims={panel.claims} />
            </section>
          ))}
        </div>
      ) : null}
      {pattern.overlapNote ? (
        <aside className="pattern-callout" aria-label="Overlap with the Anatomy page">
          <h3 className="pattern-section-heading">Overlap</h3>
          <p><ClaimText claim={pattern.overlapNote} /></p>
        </aside>
      ) : null}
    </div>
  );
}
