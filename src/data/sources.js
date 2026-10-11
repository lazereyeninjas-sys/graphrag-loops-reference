// Source registry. Every claim on every page cites ids from this map.
// One entry per line. Mirror sites are never listed here.
// URLs are display text only; the app never fetches or links them.

export const SOURCE_KINDS = Object.freeze(['primary-doc', 'paper', 'issue', 'blog', 'vendor']);

const ENTRIES = [
  { id: 'graphragDataflow', name: 'GraphRAG Dataflow docs', url: 'https://microsoft.github.io/graphrag/index/default_dataflow/', kind: 'primary-doc' },
  { id: 'graphragGlobal', name: 'GraphRAG Global Search docs', url: 'https://microsoft.github.io/graphrag/query/global_search/', kind: 'primary-doc' },
  { id: 'graphragDrift', name: 'GraphRAG DRIFT Search docs', url: 'https://microsoft.github.io/graphrag/query/drift_search/', kind: 'primary-doc' },
  { id: 'graphragQueryOverview', name: 'GraphRAG Query overview docs', url: 'https://microsoft.github.io/graphrag/query/overview/', kind: 'primary-doc' },
  { id: 'graphragCli', name: 'GraphRAG CLI docs', url: 'https://microsoft.github.io/graphrag/cli/', kind: 'primary-doc' },
  { id: 'graphragIssue741', name: 'GraphRAG issue #741', url: 'https://github.com/microsoft/graphrag/issues/741', kind: 'issue' },
  { id: 'graphragIssue2590', name: 'GraphRAG issue #2590', url: 'https://github.com/microsoft/graphrag/issues/2590', kind: 'issue' },
  { id: 'msrDriftBlog', name: 'MSR DRIFT blog', url: 'https://www.microsoft.com/en-us/research/blog/introducing-drift-search-combining-global-and-local-search-methods-to-improve-quality-and-efficiency/', kind: 'blog' },
  { id: 'msrLazyBlog', name: 'MSR LazyGraphRAG blog', url: 'https://www.microsoft.com/en-us/research/blog/lazygraphrag-setting-a-new-standard-for-quality-and-cost/', kind: 'blog' },
  { id: 'togIclr2024', name: 'Think-on-Graph (ICLR 2024 paper)', url: 'https://proceedings.iclr.cc/paper_files/paper/2024/file/10a6bdcabbd5a3d36b760daa295f63c1-Paper-Conference.pdf', kind: 'paper' },
  { id: 'togArxiv', name: 'Think-on-Graph (arXiv 2307.07697)', url: 'https://arxiv.org/abs/2307.07697', kind: 'paper' },
  { id: 'tog2V7', name: 'Think-on-Graph 2.0 (arXiv 2407.10805v7)', url: 'https://arxiv.org/html/2407.10805v7', kind: 'paper' },
  { id: 'iterRetrieval2509', name: 'Iterative retrieval in GraphRAG (arXiv 2509.25530)', url: 'https://arxiv.org/pdf/2509.25530', kind: 'paper' },
  { id: 'iterRetrieval2501', name: 'arXiv 2501.00309', url: 'https://arxiv.org/html/2501.00309v2', kind: 'paper' },
  { id: 'iterRetrieval2603', name: 'arXiv 2603.14828', url: 'https://arxiv.org/pdf/2603.14828', kind: 'paper' },
  { id: 'searchOnGraph', name: 'Search-on-Graph (arXiv 2510.08825)', url: 'https://arxiv.org/html/2510.08825', kind: 'paper' },
  { id: 'agenticSearch2604', name: 'Agentic search vs graph backends (arXiv 2604.09666)', url: 'https://arxiv.org/html/2604.09666v1', kind: 'paper' },
  { id: 'lightrag', name: 'LightRAG paper (arXiv 2410.05779)', url: 'https://arxiv.org/html/2410.05779v2', kind: 'paper' },
  { id: 'graphragAppend2606', name: 'arXiv 2606.06003', url: 'https://arxiv.org/pdf/2606.06003', kind: 'paper' },
  { id: 'raga2605', name: 'RAGA (arXiv 2605.17072)', url: 'https://arxiv.org/html/2605.17072', kind: 'paper' },
  { id: 'multiAgentCypher', name: 'Multi-Agent GraphRAG Text-to-Cypher (arXiv 2511.08274)', url: 'https://arxiv.org/html/2511.08274v1', kind: 'paper' },
  { id: 'text2cypherBiomed', name: 'Text2Cypher on biomedical KGs (bioRxiv 2025.04.23.649790)', url: 'https://www.biorxiv.org/content/10.1101/2025.04.23.649790v1.full.pdf', kind: 'paper' },
  { id: 'symbolicExec2603', name: 'arXiv 2603.05529', url: 'https://arxiv.org/pdf/2603.05529', kind: 'paper' },
  { id: 'execGrounded2601', name: 'arXiv 2601.16038', url: 'https://arxiv.org/html/2601.16038v1', kind: 'paper' },
  { id: 'ragVsGraphrag2502', name: 'RAG vs GraphRAG (arXiv 2502.11371)', url: 'https://arxiv.org/html/2502.11371v3', kind: 'paper' },
  { id: 'iclr2026GraphRag', name: 'When to use GraphRAG (ICLR 2026 paper)', url: 'https://proceedings.iclr.cc/paper_files/paper/2026/file/6c9e01d6cefbbf4cdd265032550e767f-Paper-Conference.pdf', kind: 'paper' },
  { id: 'graphragRouter2604', name: 'GraphRAG-Router (arXiv 2604.16401)', url: 'https://arxiv.org/pdf/2604.16401', kind: 'paper' },
  { id: 'stepchain2510', name: 'StepChain GraphRAG (arXiv 2510.02827)', url: 'https://arxiv.org/pdf/2510.02827', kind: 'paper' },
  { id: 'tdsGraphragPractice', name: 'Towards Data Science: GraphRAG in practice', url: 'https://towardsdatascience.com/graphrag-in-practice-how-to-build-cost-efficient-high-recall-retrieval-systems/', kind: 'blog' },
  { id: 'neo4jGraphiti', name: 'Neo4j developer blog: Graphiti', url: 'https://neo4j.com/blog/developer/graphiti-knowledge-graph-memory/', kind: 'vendor' },
  { id: 'persistentGraphrag', name: 'Persistent Systems blog: when GraphRAG outperforms RAG', url: 'https://www.persistent.com/blogs/when-does-graphrag-outperform-traditional-rag/', kind: 'vendor' },
];

export const SOURCES = Object.freeze(
  Object.fromEntries(ENTRIES.map((s) => [s.id, Object.freeze(s)])),
);

export function sourceName(id) {
  return SOURCES[id] ? SOURCES[id].name : null;
}
