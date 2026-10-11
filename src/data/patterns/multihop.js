// Page 2 pattern B2: iterative multi-hop retrieval, as two separately sourced panels.
// Exports one Pattern; validated by patterns/index.js before export.
import { LABELS } from '../labels.js';

const c = (text, sourceIds, label = null) => ({ text, sourceIds, label });
const TOG = ['togIclr2024', 'togArxiv'];
const TOG2 = ['tog2V7'];
const F = ['iterRetrieval2509'];
const AC = LABELS.AUTHORS_CLAIM;

const N = Object.freeze({
  Q: 'mhQuestion', RET: 'mhRetrieve', EVID: 'mhEvidence', CHECK: 'mhCheck', ANS: 'mhAnswer',
});

const nodes = [
  { id: N.Q, title: 'Multi-hop question', x: 80, y: 120,
    receives: [c('A question whose answer needs evidence linking several entities.', F)],
    sends: [c('The question to the first retrieval hop.', F)] },
  { id: N.RET, title: 'Retrieve: graph and context', x: 260, y: 120,
    receives: [c('The question plus the evidence and reasoning so far, which steer the next retrieval.', F)],
    sends: [c('Entity and relation paths from beam search over the KG; the best paths are kept.', TOG), c('ToG-2 alternates graph retrieval and context retrieval, using documents as context for entities.', TOG2, AC)] },
  { id: N.EVID, title: 'Evidence so far', x: 460, y: 120,
    receives: [c('Paths and passages from the latest hop.', ['togIclr2024', 'tog2V7'])],
    sends: [c('Accumulated clues to the sufficiency check.', F)] },
  { id: N.CHECK, title: 'Enough to answer?', x: 660, y: 120,
    receives: [c('The question and the clues gathered so far.', ['togIclr2024', 'tog2V7'])],
    sends: [c('Another retrieval hop when the clues do not yet answer the question.', ['togIclr2024', 'tog2V7'])],
    note: c('The exact sufficiency check and the width and depth limits are not confirmed in the gathered text.', TOG2, LABELS.UNVERIFIED) },
  { id: N.ANS, title: 'Answer', x: 660, y: 230,
    receives: [c('Clues judged sufficient to answer the question.', ['togIclr2024', 'tog2V7'])],
    sends: [c('An answer reasoned over the retrieved paths and passages.', ['togIclr2024', 'tog2V7'])] },
];

const edges = [
  { id: 'mhQToRet', from: N.Q, to: N.RET, kind: 'flow',
    label: c('The question flows into the first hop.', F) },
  { id: 'mhRetToEvid', from: N.RET, to: N.EVID, kind: 'flow',
    label: c('Retrieved paths and passages join the evidence so far.', ['togIclr2024', 'tog2V7']) },
  { id: 'mhEvidToCheck', from: N.EVID, to: N.CHECK, kind: 'flow',
    label: c('Accumulated clues are checked against the question.', ['togIclr2024', 'tog2V7']) },
  { id: 'mhCheckToRet', from: N.CHECK, to: N.RET, kind: 'feedback',
    label: c('Missing bridge evidence between entities triggers another retrieval hop.', F) },
  { id: 'mhCheckToAns', from: N.CHECK, to: N.ANS, kind: 'flow',
    label: c('Sufficient clues flow to answer generation; the exact stop rule is not confirmed.', TOG2, LABELS.UNVERIFIED) },
];

const mechanismPanel = { heading: 'Mechanism: ToG and ToG-2', claims: [
  c('ToG: an LLM agent iteratively executes beam search on a KG; entity and relation paths flow between hops and the best are kept.', TOG),
  c('ToG-2 alternates between graph retrieval and context retrieval; the KG links documents through shared entities.', TOG2),
  c('ToG-2 is training-free and works with different LLMs.', TOG2, AC),
  c('Cited version is arXiv 2407.10805v7; other versions carry a different title and the ICLR 2025 version was not read.', TOG2, LABELS.UNVERIFIED),
] };

const findingsPanel = { heading: 'Findings: arXiv 2509.25530', claims: [
  c('The question plus the evidence and reasoning so far steers the next retrieval.', F),
  c('Missing bridge evidence linking entities triggers another pass; without it, single-shot reasoning ends in hallucination.', F),
  c('Gains plateau after some number of rounds; the count is not shown here.', F, LABELS.UNVERIFIED),
  c('The same steering of retrieval by evidence so far is also described in arXiv 2501.00309 and arXiv 2603.14828.', ['iterRetrieval2501', 'iterRetrieval2603'], LABELS.SNIPPET),
] };

export const MULTIHOP = {
  id: 'multihop',
  title: 'Iterative multi-hop retrieval',
  deemphasised: false,
  graphSource: c('Runs on an existing KG, or on a graph extracted from a document database in ToG-2; no ToG paper uses communities or summaries.', ['togIclr2024', 'tog2V7'], AC),
  flows: [
    c('Entity and relation paths flow between hops, with the best paths kept.', TOG),
    c('The question plus evidence gathered so far flows back into each retrieval step.', F),
  ],
  trigger: c('Another pass runs when the clues gathered so far do not yet answer the question, such as missing bridge evidence; the exact sufficiency check is not confirmed.', ['togIclr2024', 'tog2V7', 'iterRetrieval2509'], LABELS.UNVERIFIED),
  resourceCap: c('Width and depth limits exist in ToG-2 settings, but their values and behaviour are not confirmed in the gathered text.', TOG2, LABELS.UNVERIFIED),
  sufficiencyStop: c('No sourced sufficiency stop was found; the check that ends the loop is not confirmed.', ['togIclr2024', 'tog2V7', 'iterRetrieval2509'], LABELS.UNVERIFIED),
  panels: [mechanismPanel, findingsPanel],
  flow: { id: 'multihopFlow', viewBox: '0 0 900 300', nodes, edges, dotsPerEdge: 3, cycleMs: 3600 },
};

export default MULTIHOP;
