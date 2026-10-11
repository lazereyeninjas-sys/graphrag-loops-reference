// One data dot moving along an edge path.
// Props: pathRef (ref to the edge's SVG <path>), progress in [0,1),
// optional kind ('flow' | 'feedback' | 'query') so the dot takes its edge's colour,
// optional r (radius in viewBox units).
// Position comes from getPointAtLength on the referenced path. The only motion
// source is the progress value from useAnimationClock (S12); no CSS keyframes.
// Decorative: hidden from assistive technology. No text, no network, no storage.
import { useLayoutEffect, useState } from 'react';

const KINDS = ['flow', 'feedback', 'query'];

// Clamps progress into [0,1); non-finite values fall back to 0.
function clampProgress(value) {
  if (!Number.isFinite(value)) return 0;
  const wrapped = value % 1;
  return wrapped < 0 ? wrapped + 1 : wrapped;
}

// Reads the point at the given progress along a path element, or null.
function pointOnPath(pathEl, progress) {
  if (!pathEl || typeof pathEl.getTotalLength !== 'function') return null;
  const total = pathEl.getTotalLength();
  if (!Number.isFinite(total) || total <= 0) return null;
  const pt = pathEl.getPointAtLength(total * clampProgress(progress));
  if (!pt || !Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return null;
  return { x: pt.x, y: pt.y };
}

export default function AnimatedDot({ pathRef, progress, kind = 'flow', r = 5 }) {
  const [point, setPoint] = useState(null);

  // Runs after every render: the path ref is only set once the edge has mounted,
  // and the path geometry can change with node layout. State updates only when
  // the point actually moves, so this cannot loop.
  useLayoutEffect(() => {
    const next = pointOnPath(pathRef ? pathRef.current : null, progress);
    setPoint((prev) => {
      if (prev === next) return prev;
      if (prev && next && prev.x === next.x && prev.y === next.y) return prev;
      return next;
    });
  });

  if (!point) return null;

  const safeKind = KINDS.includes(kind) ? kind : 'flow';

  return (
    <circle
      className={`flow-dot flow-dot--${safeKind}`}
      cx={point.x}
      cy={point.y}
      r={r}
      aria-hidden="true"
      focusable="false"
      pointerEvents="none"
    />
  );
}
