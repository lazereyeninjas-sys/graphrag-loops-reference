// Page 2 (Loop patterns): a tab switcher over the sourced loop patterns, each with its
// own animated FlowSpec, a play/pause control, a stage panel and the pattern details.
// Props: patternId / activeId (from the route). Unknown ids fall back to drift.
// playing and the selected node live here; switching patterns resets the selection
// but keeps playing. Factual text renders only via ClaimText; headings are chrome (S1).
import { useState } from 'react';
import { PATTERNS, findPattern } from '../data/patterns/index.js';
import { initialPlaying } from '../hooks/useAnimationClock.js';
import FlowDiagram from '../components/FlowDiagram.jsx';
import PlayPause from '../components/PlayPause.jsx';
import StagePanel from '../components/StagePanel.jsx';
import PatternSwitcher, { PATTERN_PANEL_ID, patternTabId } from './PatternSwitcher.jsx';
import PatternDetails from './PatternDetails.jsx';

export default function PatternsPage({ patternId, activeId }) {
  const pattern = findPattern(activeId || patternId);
  const [playing, setPlaying] = useState(initialPlaying);
  // Selection is tied to the pattern it was made on, so a pattern switch clears it.
  const [selection, setSelection] = useState({ patternId: null, nodeId: null });
  const selectedId = selection.patternId === pattern.id ? selection.nodeId : null;

  const select = (id) => {
    const next = id === null || id === selectedId ? null : id;
    setSelection({ patternId: pattern.id, nodeId: next });
  };

  const selected = pattern.flow.nodes.find((n) => n.id === selectedId) || null;
  const muted = pattern.deemphasised ? ' patterns-body--muted' : '';

  return (
    <div className="page page--patterns">
      <header className="page-header">
        <h1>Loop patterns</h1>
        <PlayPause playing={playing} onToggle={() => setPlaying((p) => !p)} />
        <ul className="legend" aria-label="Legend">
          <li className="legend-item legend-item--flow">solid line: stage to stage</li>
          <li className="legend-item legend-item--feedback">curved line: another pass</li>
        </ul>
      </header>
      <PatternSwitcher patterns={PATTERNS} activeId={pattern.id} />
      <div
        id={PATTERN_PANEL_ID}
        role="tabpanel"
        aria-labelledby={patternTabId(pattern.id)}
        className={`patterns-body page-columns${muted}`}
        data-pattern-id={pattern.id}
      >
        <div className="page-diagram">
          <div key={pattern.id} className="pattern-diagram pattern-diagram--enter">
            <FlowDiagram
              spec={pattern.flow}
              playing={playing}
              selectedId={selectedId}
              onSelect={select}
              ariaLabel={`${pattern.title}: select a stage to see what it receives and sends`}
            />
          </div>
          <StagePanel node={selected} />
        </div>
        <div className="page-side">
          <PatternDetails pattern={pattern} />
        </div>
      </div>
    </div>
  );
}
