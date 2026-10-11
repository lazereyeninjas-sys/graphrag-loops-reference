// Load-time content validator (STANDARDS S1-S7). Each data index.js calls these before
// export; any violation throws, so invalid content cannot mount.
import { SOURCES, SOURCE_KINDS } from './sources.js';
import { LABELS, isLabel, SUGGESTION_KIND, B4_BADGE, UPDATE_741, NOT_A_LOOP, PATTERN_IDS, USECASE_IDS } from './labels.js';

// General RAG-vs-GraphRAG and general Text2Cypher sources: never allowed in weakSpots (S4).
export const GENERAL_FINDING_SOURCES = Object.freeze(new Set(['ragVsGraphrag2502', 'iclr2026GraphRag', 'text2cypherBiomed', 'symbolicExec2603', 'execGrounded2601']));
const EDGE_KINDS = ['flow', 'feedback', 'query'];
// Stripped before the figure check: arXiv ids, issue refs, venue years, top-K, and
// method names whose digit is part of the name (ToG-2, Text2Cypher), not a figure.
const ALLOWED = [/\b\d{4}\.\d{4,5}(v\d+)?\b/g, /#\d+/g, /\b(ICLR|NeurIPS|ACL) \d{4}\b/g, /top-K/g, /\bToG-2\b/g, /\bText2Cypher\b/g];
const FIGURE = /[\d%$\u00d7]|\b(twice|times|fold)\b/i;
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const fail = (rule, id, reason) => { throw new Error(`[standards ${rule}] ${id}: ${reason}`); };
const hasDeletion = (list) => list.some((c) => /deletion/i.test(c.text) && c.label === LABELS.UNVERIFIED);

export function assertNoFigures(text, id = 'text') {
  if (typeof text !== 'string') fail('S2', id, 'text is not a string');
  const rest = ALLOWED.reduce((t, re) => t.replace(re, ''), text);
  if (FIGURE.test(rest)) fail('S2', id, `numeric figure in "${text}"`);
}

export function assertClaim(c, id = 'claim') {
  if (!c || typeof c !== 'object') fail('S1', id, 'claim missing');
  if (typeof c.text !== 'string' || !c.text.trim()) fail('S1', id, 'empty text');
  assertNoFigures(c.text, id);
  if (!Array.isArray(c.sourceIds) || c.sourceIds.length < 1) fail('S1', id, 'no sourceIds');
  c.sourceIds.forEach((s) => { if (!has(SOURCES, s)) fail('S1', id, `unknown source ${s}`); });
  if (!isLabel(c.label)) fail('S1', id, `bad label ${String(c.label)}`);
  if (/new answers/i.test(c.text) && c.label !== LABELS.UNVERIFIED) fail('S6', id, 'answer write-back is unsourced');
  return c;
}

function assertClaims(list, id) {
  if (!Array.isArray(list)) fail('S1', id, 'expected a claim array');
  list.forEach((c, i) => assertClaim(c, `${id}[${i}]`));
}

export function assertSuggestion(s, id = 'suggestion') {
  if (!s || s.kind !== SUGGESTION_KIND) fail('S5', id, 'kind must be suggestion');
  if (typeof s.text !== 'string' || !s.text.trim()) fail('S5', id, 'empty text');
  assertNoFigures(s.text, id);
  if (/\bpreset\b/i.test(s.text)) fail('S5', id, 'must not name a preset');
  if (!Array.isArray(s.basisSourceIds) || s.basisSourceIds.length < 1) fail('S5', id, 'no basisSourceIds');
  s.basisSourceIds.forEach((b) => { if (!has(SOURCES, b)) fail('S5', id, `unknown source ${b}`); });
  return s;
}

function flowClaims(spec) {
  const nodes = spec.nodes.flatMap((n) => [...n.receives, ...n.sends, ...(n.note ? [n.note] : [])]);
  return [...nodes, ...spec.edges.flatMap((e) => [...(e.label ? [e.label] : []), ...(Array.isArray(e.claims) ? e.claims : [])])];
}

export function assertFlowSpec(spec, opts = {}) {
  const id = (spec && spec.id) || 'flow';
  if (!spec || !Array.isArray(spec.nodes) || !Array.isArray(spec.edges)) fail('S1', id, 'nodes and edges required');
  const ids = new Set();
  spec.nodes.forEach((n) => {
    if (ids.has(n.id)) fail('S1', id, `duplicate node ${n.id}`);
    ids.add(n.id);
    assertNoFigures(n.title, `${id}.${n.id}.title`);
    assertClaims(n.receives, `${id}.${n.id}.receives`);
    assertClaims(n.sends, `${id}.${n.id}.sends`);
    if (n.note) assertClaim(n.note, `${id}.${n.id}.note`);
  });
  spec.edges.forEach((e) => {
    if (!ids.has(e.from) || !ids.has(e.to)) fail('S1', id, `edge ${e.id} has an unknown end`);
    if (!EDGE_KINDS.includes(e.kind)) fail('S1', id, `edge ${e.id} bad kind`);
    if (e.label) assertClaim(e.label, `${id}.${e.id}.label`);
    if (Array.isArray(e.claims)) assertClaims(e.claims, `${id}.${e.id}.claims`);
  });
  if (opts.anatomy || spec.id === 'anatomy') {
    const all = flowClaims(spec);
    const fb = spec.edges.filter((e) => e.kind === 'feedback');
    if (!fb.some((e) => e.label && e.label.text.includes(UPDATE_741))) fail('S3', id, 'feedback edge needs the #741 label');
    if (!hasDeletion(all)) fail('S3', id, 'deletions/revisions claim must be unverified');
    if (!all.some((c) => c.text.includes(NOT_A_LOOP))) fail('S3', id, 'global query path must say not a loop');
  }
  return spec;
}

export function assertPattern(p) {
  const id = (p && p.id) || 'pattern';
  if (!PATTERN_IDS.includes(id)) fail('S6', id, 'unknown pattern id');
  assertNoFigures(p.title, `${id}.title`);
  ['graphSource', 'trigger', 'resourceCap', 'sufficiencyStop'].forEach((k) => assertClaim(p[k], `${id}.${k}`));
  assertClaims(p.flows, `${id}.flows`);
  if (p.sufficiencyStop.label !== LABELS.UNVERIFIED) fail('S3', id, 'sufficiencyStop must be unverified');
  if (p.resourceCap === p.sufficiencyStop) fail('S3', id, 'cap and stop must be separate');
  if (typeof p.deemphasised !== 'boolean') fail('S3', id, 'deemphasised must be boolean');
  const panels = p.panels || [];
  panels.forEach((pl, i) => { assertNoFigures(pl.heading, `${id}.panels[${i}]`); assertClaims(pl.claims, `${id}.panels[${i}]`); });
  if (p.badge) assertClaim(p.badge, `${id}.badge`);
  if (p.overlapNote) assertClaim(p.overlapNote, `${id}.overlapNote`);
  assertFlowSpec(p.flow);
  const all = [p.graphSource, p.trigger, p.resourceCap, p.sufficiencyStop, ...p.flows, ...panels.flatMap((x) => x.claims), ...[p.badge, p.overlapNote].filter(Boolean)];
  if (id === 'critique') {
    if (p.deemphasised !== true || !p.badge || p.badge.text !== B4_BADGE) fail('S3', id, 'must be de-emphasised with B4_BADGE');
    if (![...all, ...flowClaims(p.flow)].every((c) => c.label === LABELS.SNIPPET || c.label === LABELS.UNVERIFIED)) fail('S3', id, 'labels must be snippet or unverified');
  }
  if (id === 'multihop') {
    if (panels.length !== 2) fail('S3', id, 'exactly two panels');
    const first = new Set(panels[0].claims);
    if (panels[1].claims.some((c) => first.has(c))) fail('S3', id, 'panels must not share a claim');
  }
  if (id === 'update') {
    const gr = panels.find((x) => /graphrag/i.test(x.heading));
    if (panels.length !== 2 || !gr || !gr.claims.some((c) => c.text.includes(UPDATE_741))) fail('S3', id, 'GraphRAG panel needs the #741 label');
    if (!hasDeletion(all)) fail('S3', id, 'deletions/revisions claim must be unverified');
    if (!p.overlapNote) fail('S3', id, 'overlapNote required');
  }
  return p;
}

export function assertUseCase(u) {
  const id = (u && u.patternId) || 'useCase';
  if (!USECASE_IDS.includes(id)) fail('S6', id, 'unknown use-case id');
  assertClaims(u.bestFit, `${id}.bestFit`);
  if (u.bestFit.length < 1) fail('S1', id, 'bestFit is empty');
  assertClaims(u.weakSpots, `${id}.weakSpots`);
  u.weakSpots.forEach((c, i) => { if (c.sourceIds.some((s) => GENERAL_FINDING_SOURCES.has(s))) fail('S4', `${id}.weakSpots[${i}]`, 'general finding in a weak spot'); });
  if (u.generalFindings) assertClaims(u.generalFindings, `${id}.generalFindings`);
  assertSuggestion(u.suggestion, `${id}.suggestion`);
  return u;
}

export function assertSources() {
  Object.values(SOURCES).forEach((s) => {
    if (typeof s.url !== 'string' || s.url.includes('mintlify')) fail('S7', s.id, 'mirror or missing url');
    if (!SOURCE_KINDS.includes(s.kind)) fail('S7', s.id, `bad kind ${s.kind}`);
  });
}

assertSources();
