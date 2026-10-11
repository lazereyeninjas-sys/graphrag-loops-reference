// Generic animated flow diagram: SVG edges, data dots and stage nodes from one FlowSpec.
// Props: spec (FlowSpec), playing (boolean), selectedId (node id or null),
// onSelect (called with a node id, or null to clear), optional ariaLabel (chrome text).
// Dot motion comes only from useAnimationClock (S12): each dot's progress is
// (clock + i/dotsPerEdge) % 1. Edges touching the selected node are highlighted.
// No factual text renders here; node titles come from validated data (S1, S9).
import { useMemo } from 'react';
import { useAnimationClock, dotProgress } from '../hooks/useAnimationClock.js';
import FlowEdge from './FlowEdge.jsx';
import FlowNode from './FlowNode.jsx';
import AnimatedDot from './AnimatedDot.jsx';

const EMPTY = Object.freeze([]);

// Whole number of dots per edge, at least one.
function dotCount(value) {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 1 ? n : 3;
}

export default function FlowDiagram({ spec, playing = false, selectedId = null, onSelect, ariaLabel }) {
  const nodes = spec && Array.isArray(spec.nodes) ? spec.nodes : EMPTY;
  const edges = spec && Array.isArray(spec.edges) ? spec.edges : EMPTY;
  const clock = useAnimationClock(Boolean(playing), spec ? spec.cycleMs : undefined);

  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  // One stable ref object per edge, so each dot can follow its edge's path.
  const refs = useMemo(
    () => Object.fromEntries(edges.map((e) => [e.id, { current: null }])),
    [edges],
  );

  if (!spec) return null;
  const perEdge = dotCount(spec.dotsPerEdge);
  const dotIndexes = Array.from({ length: perEdge }, (_, i) => i);
  const touches = (e) => selectedId !== null && (e.from === selectedId || e.to === selectedId);

  return (
    <div className={`flow-diagram${playing ? ' flow-diagram--playing' : ''}`} data-flow-id={spec.id}>
      <svg
        className="flow-svg"
        viewBox={spec.viewBox}
        role="group"
        aria-label={ariaLabel || 'Flow diagram: select a stage to see what it receives and sends'}
        preserveAspectRatio="xMidYMid meet"
      >
        <g className="flow-edges">
          {edges.map((e) => (
            <FlowEdge
              key={e.id}
              edge={e}
              from={byId[e.from]}
              to={byId[e.to]}
              pathRef={refs[e.id]}
              highlighted={touches(e)}
            />
          ))}
        </g>
        <g className="flow-dots" aria-hidden="true">
          {edges.map((e) => dotIndexes.map((i) => (
            <AnimatedDot
              key={`${e.id}-${i}`}
              pathRef={refs[e.id]}
              progress={dotProgress(clock, i, perEdge)}
              kind={e.kind}
            />
          )))}
        </g>
        <g className="flow-nodes">
          {nodes.map((n) => (
            <FlowNode key={n.id} node={n} selected={n.id === selectedId} onSelect={onSelect} />
          ))}
        </g>
      </svg>
    </div>
  );
}
