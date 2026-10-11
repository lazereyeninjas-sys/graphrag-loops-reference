// One stage of a flow diagram: a keyboard-focusable SVG group centred on node.x, node.y.
// Props: node ({ id, title, x, y, optional? }), selected (boolean), onSelect (function).
// Click, Enter or Space calls onSelect(node.id); the page decides whether that toggles.
// Escape on the selected node calls onSelect(null) to clear the selection.
// optional: true renders a dashed outline (e.g. the community-summary stage).
// The title comes from validated data; it renders as React text nodes only (S9).

const WIDTH = 140;
const HEIGHT = 54;
const MAX_CHARS = 18;

// Splits a title into at most two lines on word boundaries.
function titleLines(title) {
  const words = String(title || '').split(/\s+/).filter(Boolean);
  const lines = [''];
  words.forEach((w) => {
    const i = lines.length - 1;
    const next = lines[i] ? `${lines[i]} ${w}` : w;
    if (next.length > MAX_CHARS && lines[i] && lines.length < 2) lines.push(w);
    else lines[i] = next;
  });
  return lines;
}

export default function FlowNode({ node, selected = false, onSelect }) {
  if (!node || !Number.isFinite(node.x) || !Number.isFinite(node.y)) return null;
  const select = (value) => { if (typeof onSelect === 'function') onSelect(value); };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      select(node.id);
    } else if (e.key === 'Escape' && selected) {
      e.preventDefault();
      select(null);
    }
  };

  const lines = titleLines(node.title);
  const lineHeight = 15;
  const firstY = -((lines.length - 1) * lineHeight) / 2;
  const cls = `flow-node${node.optional ? ' flow-node--optional' : ''}${selected ? ' flow-node--selected' : ''}`;

  return (
    <g
      className={cls}
      transform={`translate(${node.x} ${node.y})`}
      role="button"
      tabIndex={0}
      aria-label={node.title}
      aria-pressed={Boolean(selected)}
      data-node-id={node.id}
      onClick={() => select(node.id)}
      onKeyDown={handleKeyDown}
    >
      {selected ? (
        <rect className="flow-node-ring" x={-WIDTH / 2 - 6} y={-HEIGHT / 2 - 6}
          width={WIDTH + 12} height={HEIGHT + 12} rx={14} fill="none" />
      ) : null}
      <rect
        className="flow-node-box"
        x={-WIDTH / 2}
        y={-HEIGHT / 2}
        width={WIDTH}
        height={HEIGHT}
        rx={10}
        strokeDasharray={node.optional ? '6 4' : undefined}
      />
      <text className="flow-node-title" textAnchor="middle" dominantBaseline="middle" aria-hidden="true">
        {lines.map((line, i) => (
          <tspan key={i} x={0} y={firstY + i * lineHeight}>{line}</tspan>
        ))}
      </text>
    </g>
  );
}
