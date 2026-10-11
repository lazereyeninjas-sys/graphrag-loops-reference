// Renders one pill for a claim label or the suggestion kind.
// Wording comes only from LABEL_TEXT in labels.js (STANDARDS label table).
// A null or unknown label renders nothing (no badge).
// Tones: unverified and snippet use a warning tone, authors-claim a neutral tone,
// suggestion an outline tone. Badges always carry text, so colour is never the only signal.
import { labelText, LABEL_TONE } from '../data/labels.js';

export default function LabelBadge({ label }) {
  const text = labelText(label);
  if (!text) return null;
  const tone = LABEL_TONE[label] || 'neutral';
  return (
    <span className={`label-badge label-badge--${tone}`} data-label={label}>
      {text}
    </span>
  );
}
