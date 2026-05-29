/**
 * AI Model Ranks — Directory & Sponsorship Engine
 */

const TOOLS_KEY = 'amr_tools_v3';

window.ToolsDB = {
  defaults: [
    {id:1, name:'Cursor', emoji:'💻', cat:'coding', pricing:'freemium', tagline:'The AI-first code editor.', votes:5230, url:'https://cursor.sh', b2b:true},
    {id:2, name:'Pinecone', emoji:'🌲', cat:'infrastructure', pricing:'freemium', tagline:'Vector database for high-performance AI.', votes:3102, url:'https://pinecone.io', b2b:true},
    {id:3, name:'LangSmith', emoji:'🦜', cat:'observability', pricing:'freemium', tagline:'Debug, evaluate, and monitor LLM apps.', votes:2847, url:'https://smith.langchain.com', b2b:true},
    {id:4, name:'Helicone', emoji:'📊', cat:'observability', pricing:'freemium', tagline:'Open-source LLM observability.', votes:2341, url:'https://helicone.ai', b2b:true},
    {id:5, name:'Weaviate', emoji:'🔮', cat:'infrastructure', pricing:'freemium', tagline:'Open-source vector search engine.', votes:1923, url:'https://weaviate.io', b2b:true},
    {id:6, name:'Replit', emoji:'⚡', cat:'coding', pricing:'freemium', tagline:'Build and deploy AI apps in the browser.', votes:1876, url:'https://replit.com', b2b:true},
    {id:7, name:'Perplexity', emoji:'🔬', cat:'research', pricing:'freemium', tagline:'AI-powered answer engine.', votes:1654, url:'https://perplexity.ai', b2b:true},
    {id:8, name:'Groq', emoji:'⚡', cat:'infrastructure', pricing:'freemium', tagline:'Ultra-fast LPU inference.', votes:1432, url:'https://groq.com', b2b:true},
    {id:9, name:'Together AI', emoji:'🤝', cat:'infrastructure', pricing:'freemium', tagline:'Run open-source models at scale.', votes:1287, url:'https://together.xyz', b2b:true},
    {id:10, name:'Hugging Face', emoji:'🤗', cat:'infrastructure', pricing:'freemium', tagline:'The AI community building the future.', votes:987, url:'https://huggingface.co', b2b:true}
  ],
  load() {
    try {
      const raw = localStorage.getItem(TOOLS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const savedIds = new Set(saved.map(t => t.id));
        return [...saved, ...this.defaults.filter(d => !savedIds.has(d.id))];
      }
      return [...this.defaults];
    } catch { return [...this.defaults]; }
  },
  getB2BTools() {
    return this.load().filter(t => t.b2b !== false).sort((a,b) => b.votes - a.votes);
  }
};

window.buildRefURL = function(tool) {
  if (window.ConfigManager) {
    const custom = ConfigManager.getReferral(tool.name);
    if (custom && custom !== '#') return custom;
  }
  const url = tool.url || '';
  const sep = url.includes('?') ? '&' : '?';
  return url + sep + 'ref=aimodelranks';
};
