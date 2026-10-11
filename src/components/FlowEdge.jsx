// One edge of a flow diagram, drawn as an SVG path between two node centres.
// Props: edge ({ id, from, to, kind }), from and to (the end nodes, with x and y),
// pathRef (ref passed to the <path> so AnimatedDot can follow it), and an optional
// highlighted flag for edges touching the selected node.
// kind 'flow' is solid, 'query' is dotted, 'feedback' is a curved return path.
// A small arrow at the midpoint shows direction. Decorative: no text here; edge
// label claims render through ClaimText elsewhere (S1). No keyframes (S12).

const KINDS = ['flow', 'feedback', 'query'];
const DASH = { flow: undefined, feedback: '10 5', query: '2 6' };

// Geometry for an edge: the SVG path, plus the midpoint and tangent for the arrow.
function edgeGeometry(a, b, curved) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  if (!curved) {
    return {
      d: `M ${a.x} ${a.y} L ${b.x} ${b.y}`,
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      tan: { x: dx / len, y: dy / len },
    };
  }
  // Quadratic curve bending away along the normal, preferring the lower side.
  let nx = -dy / len;
  let ny = dx / len;
  if (ny < 0) { nx = -nx; ny = -ny; }
  const bend = Math.max(60, len * 0.3);
  const c = { x: (a.x + b.x) / 2 + nx * bend, y: (a.y + b.y) / 2 + ny * bend };
  const mid = { x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y };
  const tx = b.x - a.x;
  const ty = b.y - a.y;
  const tl = Math.hypot(tx, ty) || 1;
  return { d: `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`, mid, tan: { x: tx / tl, y: ty / tl } };
}

// Small triangle centred on the midpoint, pointing along the tangent.
function arrowPoints(mid, tan, size = 6) {
  const px = -tan.y;
  const py = tan.x;
  const tip = `${mid.x + tan.x * size},${mid.y + tan.y * size}`;
  const l = `${mid.x - tan.x * size + px * size * 0.8},${mid.y - tan.y * size + py * size * 0.8}`;
  const r = `${mid.x - tan.x * size - px * size * 0.8},${mid.y - tan.y * size - py * size * 0.8}`;
  return `${tip} ${l} ${r}`;
}

const valid = (n) => n && Number.isFinite(n.x) && Number.isFinite(n.y);

export default function FlowEdge({ edge, from, to, pathRef, highlighted = false }) {
  if (!edge || !valid(from) || !valid(to)) return null;
  const kind = KINDS.includes(edge.kind) ? edge.kind : 'flow';
  const { d, mid, tan } = edgeGeometry(from, to, kind === 'feedback');
  const cls = `flow-edge flow-edge--${kind}${highlighted ? ' flow-edge--highlighted' : ''}`;

  return (
    <g className={cls} data-edge-id={edge.id} aria-hidden="true" pointerEvents="none">
      <path
        ref={pathRef}
        className="flow-edge-path"
        d={d}
        fill="none"
        strokeDasharray={DASH[kind]}
        strokeLinecap="round"
      />
      <polygon className="flow-edge-arrow" points={arrowPoints(mid, tan)} />
    </g>
  );
}
