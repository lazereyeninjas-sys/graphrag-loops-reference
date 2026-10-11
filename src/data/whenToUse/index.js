// Page 3 (When to use) data entry point. Validates the framing claims, the query-type
// gate and every use case, then exports FRAMING, GATE and USE_CASES.
// Imports only from this folder and the shared registries (S13).
import { assertClaim, assertSuggestion, assertUseCase, GENERAL_FINDING_SOURCES } from '../validate.js';
import { USECASE_IDS } from '../labels.js';
import { FRAMING as RAW_FRAMING } from './framing.js';
import { GATE as RAW_GATE } from './gate.js';
import { USE_CASES as RAW_USE_CASES } from './useCases.js';

const fail = (rule, id, reason) => {
  throw new Error(`[standards ${rule}] ${id}: ${reason}`);
};

// Framing: Claim[], general findings that frame the page (never pattern weak spots).
if (!Array.isArray(RAW_FRAMING) || RAW_FRAMING.length < 1) fail('S1', 'framing', 'expected a non-empty claim array');
RAW_FRAMING.forEach((claim, i) => assertClaim(claim, `framing[${i}]`));

// Gate: { branches: [{ when: Claim, to: Claim }], suggestion: Suggestion }, static.
if (!RAW_GATE || !Array.isArray(RAW_GATE.branches) || RAW_GATE.branches.length < 1) {
  fail('S1', 'gate', 'branches required');
}
RAW_GATE.branches.forEach((b, i) => {
  assertClaim(b.when, `gate.branches[${i}].when`);
  assertClaim(b.to, `gate.branches[${i}].to`);
});
assertSuggestion(RAW_GATE.suggestion, 'gate.suggestion');

// Use cases: each validated, ids must match the frozen enum in display order (S6).
if (!Array.isArray(RAW_USE_CASES)) fail('S1', 'useCases', 'expected a use-case array');
RAW_USE_CASES.forEach((u) => assertUseCase(u));
if (RAW_USE_CASES.map((u) => u.patternId).join('|') !== USECASE_IDS.join('|')) {
  fail('S6', 'useCases', 'ids must match USECASE_IDS in order');
}

// Weak spots are never back-filled from general findings (S4); re-checked across the set.
RAW_USE_CASES.forEach((u) => {
  u.weakSpots.forEach((claim, i) => {
    if (claim.sourceIds.some((s) => GENERAL_FINDING_SOURCES.has(s))) {
      fail('S4', `${u.patternId}.weakSpots[${i}]`, 'general finding in a weak spot');
    }
  });
});

export const FRAMING = Object.freeze([...RAW_FRAMING]);

export const GATE = Object.freeze({
  branches: Object.freeze(RAW_GATE.branches.map((b) => Object.freeze({ ...b }))),
  suggestion: Object.freeze({ ...RAW_GATE.suggestion }),
});

export const USE_CASES = Object.freeze(RAW_USE_CASES.map((u) => Object.freeze(u)));

export { USECASE_IDS };
