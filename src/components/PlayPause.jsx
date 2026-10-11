// Play/pause control for the animated flow diagrams.
// Props: playing (boolean), onToggle (function).
// Uses aria-pressed to expose the toggle state. Chrome text only:
// the button reads "Pause" while playing and "Play" while paused.
// Pages start paused under reduced motion, so the button then reads "Play".

export default function PlayPause({ playing, onToggle }) {
  const isPlaying = Boolean(playing);
  const label = isPlaying ? 'Pause' : 'Play';

  const handleClick = () => {
    if (typeof onToggle === 'function') onToggle();
  };

  return (
    <button
      type="button"
      className={`play-pause${isPlaying ? ' play-pause--playing' : ''}`}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
      onClick={handleClick}
    >
      <svg
        className="play-pause-icon"
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
        focusable="false"
      >
        {isPlaying ? (
          <g>
            <rect x="3" y="2" width="3.5" height="12" rx="1" />
            <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
          </g>
        ) : (
          <path d="M4 2 L14 8 L4 14 Z" />
        )}
      </svg>
      <span className="play-pause-text">{label}</span>
    </button>
  );
}
