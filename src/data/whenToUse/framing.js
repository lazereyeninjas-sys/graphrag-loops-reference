// Page 3 (When to use) framing claims, shown as lead paragraphs above the query gate.
// Shape: FRAMING is Claim[]. These are general RAG-vs-GraphRAG findings: they frame the
// page and never fill a pattern-specific weak-spot cell (S4).
// Validated by whenToUse/index.js before export.
import { LABELS } from '../labels.js';

const c = (text, sourceIds, label = null) => ({ text, sourceIds, label });

export const FRAMING = [
  c('Plain RAG does best on single-hop, detail questions; GraphRAG does best on multi-hop and corpus-wide summary questions.', ['ragVsGraphrag2502']),
  c('GraphRAG frequently underperforms vanilla RAG on many real-world tasks, with gains on complex reasoning and summarization.', ['iclr2026GraphRag'], LABELS.SNIPPET),
  c('Mechanism consistent with these findings: vector RAG struggles on corpus-wide questions such as the main themes in the data, because nothing in the query points to the right passages.', ['graphragGlobal']),
  c('Evaluation bias, including LLM-judge bias, is a listed risk when comparing RAG and GraphRAG.', ['ragVsGraphrag2502', 'persistentGraphrag']),
];

export default FRAMING;
