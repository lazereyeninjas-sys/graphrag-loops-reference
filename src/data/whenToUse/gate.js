// Page 3 (When to use) query-type gate, placed before any loop. Routing runs once per
// query and is not a loop pattern. Shape: { branches: [{ when: Claim, to: Claim }],
// suggestion: Suggestion }. Static: no flow field. Validated by whenToUse/index.js.
import { LABELS, SUGGESTION_KIND } from '../labels.js';

const c = (text, sourceIds, label = null) => ({ text, sourceIds, label });
const RVG = ['ragVsGraphrag2502'];
const ROUTER = ['graphragRouter2604'];

const singleHop = {
  when: c('Single-hop, detail questions, where the answer sits in a few passages.', RVG),
  to: c('Route to plain RAG, which does best on single-hop, detail questions.', RVG),
};

const multiHop = {
  when: c('Multi-hop questions or corpus-wide summary questions.', RVG),
  to: c('Route to a graph loop; selecting a backend by query type improves results, though tests were mostly on Wikipedia QA, so generalisation is untested.', ['ragVsGraphrag2502', 'graphragRouter2604'], LABELS.SNIPPET),
};

export const GATE = {
  branches: [singleHop, multiHop],
  suggestion: {
    text: 'Place a query-type gate before any loop: send single-hop questions to plain RAG and multi-hop or corpus-wide questions to a graph loop. The gate runs once per query and is not itself a loop.',
    kind: SUGGESTION_KIND,
    basisSourceIds: [...RVG, ...ROUTER],
  },
};

export default GATE;
