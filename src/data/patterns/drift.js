// Page 2 pattern B1: DRIFT search, iterative follow-up questions over a GraphRAG index.
// Exports one Pattern; validated by patterns/index.js before export.
import { LABELS } from '../labels.js';

const c = (text, sourceIds, label = null) => ({ text, sourceIds, label });
const DOCS = ['graphragDrift'];
const BOTH = ['graphragDrift', 'msrDriftBlog'];

const N = Object.freeze({
  QUERY: 'driftQuery', PRIMER: 'driftPrimer', STATE: 'driftState', LOCAL: 'driftLocal', OUT: 'driftOutput',
});

const nodes = [
  { id: N.QUERY, title: 'User query', x: 80, y: 120,
    receives: [c('A user question, typically a local question that benefits from broader community context.', ['msrDriftBlog'])],
    sends: [c('The query to the primer step.', DOCS)] },
  { id: N.PRIMER, title: 'Primer: top-K community reports', x: 250, y: 120,
    receives: [c('The query, compared with the top-K community reports.', DOCS)],
    sends: [c('An initial answer plus follow-up questions.', DOCS)] },
  { id: N.STATE, title: 'Query state', x: 450, y: 120,
    receives: [c('Follow-up questions from the primer and from each local search pass.', DOCS)],
    sends: [c('Pending follow-up questions to local search, while the token budget allows.', DOCS)],
    note: c('The query state tracks follow-ups and a token budget across passes.', DOCS) },
  { id: N.LOCAL, title: 'Local search on follow-ups', x: 650, y: 120,
    receives: [c('Follow-up questions from the query state.', DOCS)],
    sends: [c('Intermediate answers and further follow-up questions.', DOCS)] },
  { id: N.OUT, title: 'Ranked Q&A hierarchy', x: 450, y: 230,
    receives: [c('The initial answer, intermediate answers and their questions.', DOCS)],
    sends: [c('A ranked hierarchy of questions and answers as the output.', DOCS)] },
];

const edges = [
  { id: 'driftQueryToPrimer', from: N.QUERY, to: N.PRIMER, kind: 'flow',
    label: c('The query flows into the primer.', DOCS) },
  { id: 'driftPrimerToState', from: N.PRIMER, to: N.STATE, kind: 'flow',
    label: c('Initial answer and follow-up questions enter the query state.', DOCS) },
  { id: 'driftStateToLocal', from: N.STATE, to: N.LOCAL, kind: 'flow',
    label: c('Follow-up questions flow to local search.', DOCS) },
  { id: 'driftLocalToState', from: N.LOCAL, to: N.STATE, kind: 'feedback',
    label: c('Further follow-up questions return to the query state and trigger another pass.', DOCS) },
  { id: 'driftStateToOutput', from: N.STATE, to: N.OUT, kind: 'flow',
    label: c('Answers are ranked into a question-and-answer hierarchy; what ends the loop beyond the token budget is not found in sources.', DOCS, LABELS.UNVERIFIED) },
];

export const DRIFT = {
  id: 'drift',
  title: 'DRIFT search',
  deemphasised: false,
  graphSource: c('Runs on a GraphRAG index: community reports for the primer, local search for follow-ups.', BOTH),
  flows: [
    c('Primer: the query is compared with the top-K community reports, giving an initial answer plus follow-up questions.', DOCS),
    c('Local search answers the follow-ups, producing intermediate answers and further follow-up questions.', DOCS),
    c('The output is a ranked hierarchy of questions and answers.', DOCS),
    c('Version note: the MSR blog is the launch post and the docs page is the living reference; the two were not compared, and where they differ this app follows the docs.', BOTH, LABELS.UNVERIFIED),
  ],
  trigger: c('Further follow-up questions trigger another pass. The docs refer to the algorithm\'s confidence for continuing, but that term is undefined in the gathered material.', DOCS, LABELS.UNVERIFIED),
  resourceCap: c('Token budget, tracked in the query state across passes.', DOCS),
  sufficiencyStop: c('No sufficiency stop, depth limit or follow-up limit was found in the sources.', BOTH, LABELS.UNVERIFIED),
  flow: {
    id: 'driftFlow',
    viewBox: '0 0 900 300',
    nodes,
    edges,
    dotsPerEdge: 3,
    cycleMs: 3600,
  },
};

export default DRIFT;
