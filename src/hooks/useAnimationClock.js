// Animation clock for data dots. The only motion source for dots (S12).
// useAnimationClock(playing, cycleMs) returns progress in [0,1).
// Driven by requestAnimationFrame; cancelled on pause and on unmount.
// Progress is kept on pause, so play resumes where it stopped.
// Pages start with playing = !prefersReducedMotion(), so reduced motion starts paused.
import { useEffect, useRef, useState } from 'react';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

// True when the user has asked for reduced motion.
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(REDUCED_QUERY).matches;
}

// Initial playing state for a page: paused under reduced motion.
export function initialPlaying() {
  return !prefersReducedMotion();
}

// Dot progress along an edge: (clock + i/dotsPerEdge) % 1.
export function dotProgress(clock, index, dotsPerEdge) {
  const count = dotsPerEdge > 0 ? dotsPerEdge : 1;
  const value = (clock + index / count) % 1;
  return value < 0 ? value + 1 : value;
}

export function useAnimationClock(playing, cycleMs) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const frameRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    const hasRaf = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function';
    if (!playing || !hasRaf) return undefined;
    const cycle = Number.isFinite(cycleMs) && cycleMs > 0 ? cycleMs : 4000;
    lastRef.current = null;

    const tick = (now) => {
      if (lastRef.current !== null) {
        const delta = Math.max(0, now - lastRef.current);
        progressRef.current = (progressRef.current + delta / cycle) % 1;
        setProgress(progressRef.current);
      }
      lastRef.current = now;
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastRef.current = null;
    };
  }, [playing, cycleMs]);

  return progress;
}

export default useAnimationClock;
