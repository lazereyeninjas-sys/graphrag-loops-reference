// Page 2 pattern B4: critique-and-retry over generated graph queries (Text2Cypher).
// Snippet-level and de-emphasised; every claim is labelled snippet or unverified.
// Exports one Pattern; validated by patterns/index.js before export.
import { LABELS, B4_BADGE } from '../labels.js';

const c = (text, sourceIds, label) => ({ text, sourceIds, label });
const MA = ['multiAgentCypher'];
const SN = LABELS.SNIPPET;
const UV = LABELS.UNVERIFIED;

const N = Object.freeze({
  Q: 'crQuestion', GEN: 'crGenerate', VERIFY: 'crVerify', EXEC: 'crExecute', FEED: 'crFeedback', INTERP: 'crInterpreter',
});

const nodes = [
  { id: N.Q, title: 'Natural-language question', x: 80, y: 120,
    receives: [c('A natural-language question over a labeled property graph.', MA, SN)],
    sends: [c('The question to Cypher generation.', MA, SN)] },
  { id: N.GEN, title: 'Generate Cypher', x: 240, y: 120,
    receives: [c('The question, or a corrected query request carrying aggregated feedback.', MA, SN)],
    sends: [c('A generated Cypher query.', MA, SN)] },
  { id: N.VERIFY, title: 'Entity verification', x: 400, y: 120,
    receives: [c('The generated Cypher query.', MA, SN)],
    sends: [c('The query with its entities checked against the graph.', MA, SN)] },
  { id: N.EXEC, title: 'Execute query', x: 560, y: 120,
    receives: [c('The verified Cypher query.', MA, SN)],
    sends: [c('Execution results, or errors to the feedback step.', MA, SN)] },
  { id: N.FEED, title: 'Aggregated feedback', x: 400, y: 230,
    receives: [c('Syntax errors, semantic errors or schema mismatches found during verification and execution.', MA, SN)],
    sends: [c('Aggregated feedback for a corrected query.', MA, SN)],
    note: c('The retry cap is not confirmed in the gathered material.', MA, UV) },
  { id: N.INTERP, title: 'Interpreter writes answer', x: 760, y: 120,
    receives: [c('Results from a successfully executed query.', MA, SN)],
    sends: [c('A natural-language answer written by an interpreter.', MA, SN)] },
];

const edges = [
  { id: 'crQToGen', from: N.Q, to: N.GEN, kind: 'flow', label: c('The question flows into Cypher generation.', MA, SN) },
  { id: 'crGenToVerify', from: N.GEN, to: N.VERIFY, kind: 'flow', label: c('Generated Cypher flows into entity verification.', MA, SN) },
  { id: 'crVerifyToExec', from: N.VERIFY, to: N.EXEC, kind: 'flow', label: c('The verified query is executed.', MA, SN) },
  { id: 'crExecToFeed', from: N.EXEC, to: N.FEED, kind: 'flow', label: c('Errors and schema mismatches flow into aggregated feedback.', MA, SN) },
  { id: 'crFeedToGen', from: N.FEED, to: N.GEN, kind: 'feedback', label: c('Aggregated feedback triggers a corrected query and another pass.', MA, SN) },
  { id: 'crExecToInterp', from: N.EXEC, to: N.INTERP, kind: 'flow', label: c('Successful results flow to the interpreter; what ends retries otherwise is not confirmed.', MA, UV) },
];

export const CRITIQUE = {
  id: 'critique',
  title: 'Critique-and-retry (Text2Cypher)',
  deemphasised: true,
  badge: c(B4_BADGE, MA, UV),
  graphSource: c('Runs on an existing labeled property graph; there is no extraction stage and no community layer.', MA, SN),
  flows: [
    c('Generated Cypher flows through entity verification and execution, then aggregated feedback yields a corrected query, and an interpreter writes the answer.', MA, SN),
    c('Described as a construction-domain proof of concept; only a snippet of arXiv 2511.08274 was seen.', MA, SN),
  ],
  trigger: c('A syntax error, a semantic error or a mismatch with the schema triggers another pass.', MA, SN),
  resourceCap: c('A retry cap is not confirmed in the gathered material.', MA, UV),
  sufficiencyStop: c('No sufficiency stop beyond a successfully executed query was found in the sources.', MA, UV),
  flow: { id: 'critiqueFlow', viewBox: '0 0 900 300', nodes, edges, dotsPerEdge: 3, cycleMs: 3600 },
};

export default CRITIQUE;
