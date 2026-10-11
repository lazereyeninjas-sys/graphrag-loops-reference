// Label registry and fixed display strings.
// LabelBadge renders exactly the wording in LABEL_TEXT.
// Data files import the fixed strings below instead of retyping them.

// Claim labels. A claim carries one of these values, or null for no badge.
export const LABELS = Object.freeze({
  SNIPPET: 'snippet',
  AUTHORS_CLAIM: 'authors-claim',
  UNVERIFIED: 'unverified',
});

// Every allowed claim label value, for membership checks.
export const LABEL_VALUES = Object.freeze(Object.values(LABELS));

// Separate kind used only for Agent Command notes. It is not a claim label.
export const SUGGESTION_KIND = 'suggestion';

// Display wording for each label value and for the suggestion kind.
export const LABEL_TEXT = Object.freeze({
  snippet: 'snippet',
  'authors-claim': "authors' claim",
  unverified: 'unverified',
  suggestion: 'suggestion',
});

// Tone used by LabelBadge styling for each badge.
export const LABEL_TONE = Object.freeze({
  snippet: 'warning',
  'authors-claim': 'neutral',
  unverified: 'warning',
  suggestion: 'outline',
});

// True when value is a claim label or null (null means no badge).
export function isLabel(value) {
  return value === null || LABEL_VALUES.includes(value);
}

// Display text for a label or kind; null when no badge is shown.
export function labelText(value) {
  if (value === null || value === undefined) return null;
  return LABEL_TEXT[value] || null;
}

// Fixed strings.
export const B4_BADGE = 'snippet-level, unverified';
export const UPDATE_741 = 'as described by maintainers in #741; current CLI behaviour unverified';
export const EMPTY_WEAK = 'Empty \u2014 unverified';
export const NOT_A_LOOP = 'not a loop';

// Frozen id enums. Any other pattern or use-case id is rejected.
export const PATTERN_IDS = Object.freeze(['drift', 'multihop', 'update', 'critique']);
export const USECASE_IDS = Object.freeze([
  'drift',
  'multihop-tog',
  'multihop-findings',
  'update',
  'critique',
  'global',
]);
