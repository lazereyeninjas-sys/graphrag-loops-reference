// Page 1 (Anatomy): the GraphRAG Dataflow pipeline with its re-index feedback loop,
// plus the single-pass global map-reduce query path. Factual text renders only via
// ClaimText; headings, legend and prompts are chrome (S1).
import { useState } from 'react';
import { ANATOMY_FLOW, FEEDBACK_CAPTIONS, GLOBAL_PATH_CLAIMS, GLOBAL_NOT_A_LOOP } from '../data/anatomy/index.js';
import { initialPlaying } from '../hooks/useAnimationClock.js';
import FlowDiagram from '../components/FlowDiagram.jsx';
import PlayPause from '../components/PlayPause.jsx';
import StagePanel from '../components/StagePanel.jsx';
import ClaimText from '../components/ClaimText.jsx';

const LEGEND = [
  { kind: 'flow', text: 'solid line: pipeline' },
  { kind: 'feedback', text: 'curved line: re-index feedback' },
  { kind: 'query', text: 'dotted line: query path' },
  { kind: 'optional', text: 'dashed node: optional stage' },
];

function ClaimItems({ claims }) {
  return (
    <ul className="caption-list">
      {claims.map((claim, i) => <li key={i} className="caption-item"><ClaimText claim={claim} /></li>)}
    </ul>
  );
}

export default function AnatomyPage() {
  const [playing, setPlaying] = useState(initialPlaying);
  const [selectedId, setSelectedId] = useState(null);
  const select = (id) => setSelectedId((prev) => (id === null || id === prev ? null : id));
  const selected = ANATOMY_FLOW.nodes.find((n) => n.id === selectedId) || null;
  const touching = selected
    ? ANATOMY_FLOW.edges.filter((e) => e.label && (e.from === selectedId || e.to === selectedId))
    : [];

  return (
    <div className="page page--anatomy">
      <header className="page-header">
        <h1>Anatomy</h1>
        <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
        <ul className="legend" aria-label="Legend">
          {LEGEND.map((l) => <li key={l.kind} className={`legend-item legend-item--${l.kind}`}>{l.text}</li>)}
        </ul>
      </header>
      <div className="page-columns">
        <div className="page-diagram">
          <FlowDiagram
            spec={ANATOMY_FLOW}
            playing={playing}
            selectedId={selectedId}
            onSelect={select}
            ariaLabel="GraphRAG re-index loop: select a stage to see what it receives and sends"
          />
          <section className="captions captions--feedback" aria-label="Re-index feedback edge">
            <h2 className="captions-heading">Re-index feedback edge</h2>
            <ClaimItems claims={FEEDBACK_CAPTIONS} />
          </section>
          <section className="captions captions--global" aria-label="Global map-reduce query path">
            <h2 className="captions-heading">
              Global map-reduce query path{' '}
              <span className="not-a-loop-tag"><ClaimText claim={GLOBAL_NOT_A_LOOP} /></span>
            </h2>
            <ClaimItems claims={GLOBAL_PATH_CLAIMS.filter((c) => c !== GLOBAL_NOT_A_LOOP)} />
          </section>
        </div>
        <div className="page-side">
          <StagePanel node={selected} />
          {touching.length > 0 ? (
            <section className="captions captions--edges" aria-label="Connected edges">
              <h3 className="captions-heading">Connected edges</h3>
              <ClaimItems claims={touching.map((e) => e.label)} />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
