// Page 2 (Loop patterns) data entry point. Validates every pattern, then exports
// PATTERNS in display order. Imports only from this folder and the shared registries (S13).
import { assertPattern } from '../validate.js';
import { PATTERN_IDS } from '../labels.js';
import { DRIFT } from './drift.js';
import { MULTIHOP } from './multihop.js';
import { UPDATE } from './update.js';
import { CRITIQUE } from './critique.js';

// Display order: three sourced patterns, then the de-emphasised snippet-level pattern.
const ORDERED = [DRIFT, MULTIHOP, UPDATE, CRITIQUE];

// Load-time validation: throws on any content violation, so invalid content cannot mount.
ORDERED.forEach((p) => assertPattern(p));

// Every frozen pattern id must appear exactly once, in the frozen order.
if (ORDERED.map((p) => p.id).join('|') !== PATTERN_IDS.join('|')) {
  throw new Error('[standards S6] patterns: ids must match PATTERN_IDS in order');
}

export const PATTERNS = Object.freeze(ORDERED.map((p) => Object.freeze(p)));

export const DEFAULT_PATTERN_ID = 'drift';

// Returns the pattern for an id, falling back to the default (drift) for unknown ids.
export function findPattern(id) {
  return PATTERNS.find((p) => p.id === id) || PATTERNS.find((p) => p.id === DEFAULT_PATTERN_ID);
}

export { PATTERN_IDS };
