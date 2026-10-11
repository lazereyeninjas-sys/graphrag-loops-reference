// Side panel for the selected stage of a flow diagram.
// Props: node (a Node from a FlowSpec, or null when nothing is selected).
// Shows the node title, a "Receives" list and a "Sends" list (each Claim[]),
// and the node's note claim when present. All factual text renders through
// ClaimText (S1); headings and the empty prompt are chrome only.
// Text renders as React text nodes only; no injection sinks (S9).
import ClaimText from './ClaimText.jsx';

const EMPTY_PROMPT = 'Select a stage to see what it receives and sends.';

// Renders a list of claims, or nothing when the list is empty or missing.
function ClaimList({ claims, className }) {
  const list = Array.isArray(claims) ? claims : [];
  if (list.length === 0) return null;
  return (
    <ul className={`stage-panel-list ${className}`}>
      {list.map((claim, i) => (
        <li key={i} className="stage-panel-item">
          <ClaimText claim={claim} />
        </li>
      ))}
    </ul>
  );
}

export default function StagePanel({ node }) {
  if (!node) {
    return (
      <aside className="stage-panel stage-panel--empty" aria-live="polite">
        <p className="stage-panel-prompt">{EMPTY_PROMPT}</p>
      </aside>
    );
  }

  const receives = Array.isArray(node.receives) ? node.receives : [];
  const sends = Array.isArray(node.sends) ? node.sends : [];
  const cls = `stage-panel${node.optional ? ' stage-panel--optional' : ''}`;

  return (
    <aside className={cls} aria-live="polite" data-node-id={node.id}>
      <h2 className="stage-panel-title">{node.title}</h2>
      {node.optional ? (
        <p className="stage-panel-optional">Optional stage</p>
      ) : null}

      <section className="stage-panel-section">
        <h3 className="stage-panel-heading">Receives</h3>
        {receives.length > 0 ? (
          <ClaimList claims={receives} className="stage-panel-list--receives" />
        ) : (
          <p className="stage-panel-none">Nothing listed for this stage.</p>
        )}
      </section>

      <section className="stage-panel-section">
        <h3 className="stage-panel-heading">Sends</h3>
        {sends.length > 0 ? (
          <ClaimList claims={sends} className="stage-panel-list--sends" />
        ) : (
          <p className="stage-panel-none">Nothing listed for this stage.</p>
        )}
      </section>

      {node.note ? (
        <section className="stage-panel-section stage-panel-note">
          <h3 className="stage-panel-heading">Note</h3>
          <p className="stage-panel-note-text">
            <ClaimText claim={node.note} />
          </p>
        </section>
      ) : null}
    </aside>
  );
}
