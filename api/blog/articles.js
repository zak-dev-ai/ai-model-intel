// api/blog/articles.js
// Serverless endpoint: generates + caches daily AI blog articles
// Falls back gracefully — blog page has hardcoded articles too

const SUPABASE_URL = 'https://jkoxrftlslylfmugjomd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprb3hyZnRsc2x5bGZtdWdqb21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjAzNTEsImV4cCI6MjA5MzM5NjM1MX0.1LVo1a2K2V8QZPX94bVTBmzIxUskKp0mR7RmNwgOdcI';
const MODELS_API = 'https://ai-model-intel.zak-media-ai.workers.dev/pricing';
const CACHE_KEY = 'blog_articles_json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Try cache (stored in analytics table as JSON string)
    let articles = await loadFromCache();
    
    // Check if we need fresh articles
    const today = new Date().toISOString().split('T')[0];
    const needFresh = !articles || articles.length === 0 || articles[0]?.date !== today;
    
    if (needFresh) {
      articles = await generateArticles();
      if (articles.length > 0) {
        await saveToCache(articles, SUPABASE_KEY).catch(() => {});
      }
    }

    return res.status(200).json({ articles: articles || [] });
  } catch (e) {
    return res.status(200).json({ articles: [] });
  }
}

async function loadFromCache() {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/analytics?event=eq.${CACHE_KEY}&select=value&limit=1&order=created_at.desc`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    if (!r.ok) return null;
    const data = await r.json();
    if (data && data.length > 0 && data[0].value) {
      return typeof data[0].value === 'string' ? JSON.parse(data[0].value) : data[0].value;
    }
    return null;
  } catch { return null; }
}

async function saveToCache(articles, key) {
  await fetch(`${SUPABASE_URL}/rest/v1/analytics`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      event: CACHE_KEY,
      page: '/blog',
      value: JSON.stringify(articles),
      created_at: new Date().toISOString()
    })
  });
}

async function generateArticles() {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const articles = [];
  let modelData = [];

  // Fetch model data for pricing articles
  try {
    const r = await fetch(MODELS_API);
    const d = await r.json();
    modelData = d.pricing || [];
  } catch {}

  // Fetch RSS for news context
  let rssHeadlines = [];
  try {
    const rss = await fetch('https://hnrss.org/frontpage?count=10');
    const text = await rss.text();
    const matches = text.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/g) || [];
    rssHeadlines = matches.slice(0, 5).map(m => 
      m.replace('<title><![CDATA[', '').replace(']]></title>', '')
    ).filter(h => !/^(Ask|Show) HN/.test(h));
  } catch {}

  // 1. Pricing article
  if (modelData.length > 0) {
    const top3 = modelData.slice(0, 3);
    articles.push({
      id: Date.now() + 1, cat: 'pricing', emoji: '💰', tag: 'PRICING',
      title: `AI Price Watch — ${today}`,
      excerpt: `Cheapest: ${top3[0]?.model?.split(': ').pop() || 'N/A'} at $${top3[0]?.input_cost_per_mtok || '?'}/1M input.`,
      date: today, read: '3 min', views: '0.8K',
      featured: false, isNew: true, isAI: true,
      bg: 'linear-gradient(135deg,#001a0a,#003018)',
      content: `<h2>Top Budget Models Today</h2>
        <div class="price-table">
          ${top3.map(m => `<div class="price-row"><span>${m.model?.split(': ').pop() || m.model}</span><span class="pv">$${m.input_cost_per_mtok}/1M</span></div>`).join('')}
        </div>
        <div class="highlight">Route simple tasks to budget models ($0.02-0.05/1M). Save premium models for complex reasoning. This alone cuts API bills 60-80%.</div>
        <p>Full live rankings at <a href="https://www.aimodelranks.live/compare" style="color:var(--cyan)">aimodelranks.live</a> — 200+ models tracked.</p>`
    });
  }

  // 2. Catch-all AI news article
  const newsSnippet = rssHeadlines.length > 0 
    ? rssHeadlines.slice(0, 2).join(', ')
    : 'AI industry continues rapid evolution with new model releases and tool updates.';

  articles.push({
    id: Date.now() + 2, cat: 'news', emoji: '📰', tag: 'AI NEWS',
    title: `AI Briefing — ${today}`,
    excerpt: newsSnippet.substring(0, 120),
    date: today, read: '3 min', views: '0.5K',
    featured: articles.length === 0, isNew: true, isAI: true,
    bg: 'linear-gradient(135deg,#001428,#002850)',
    content: `<h2>Today in AI</h2>
      ${rssHeadlines.length > 0 
        ? rssHeadlines.map((h, i) => `<h2>${i+1}. ${h}</h2><p>Trending on Hacker News today.</p>`).join('')
        : `<p>AI pricing continues to drop. New models are being released at lower price points. Check <a href="https://www.aimodelranks.live/compare" style="color:var(--cyan)">aimodelranks.live</a> for the latest data.</p>`
      }
      <div class="highlight">Bookmark aimodelranks.live for daily AI model intelligence.</div>`
  });

  // 3. Tools article
  articles.push({
    id: Date.now() + 3, cat: 'tools', emoji: '🛠', tag: 'AI TOOLS',
    title: `AI Tool Spotlight — ${today}`,
    excerpt: 'Community-voted AI tools you should know about this week.',
    date: today, read: '3 min', views: '0.6K',
    featured: false, isNew: true, isAI: false,
    bg: 'linear-gradient(135deg,#0a0a28,#1a1a50)',
    content: `<h2>This Week's Standouts</h2>
      <p>AI development tools continue to transform how we build. Browse and vote at <a href="https://www.aimodelranks.live/tools" style="color:var(--cyan)">aimodelranks.live/tools</a>.</p>
      <h2>Code Assistants</h2>
      <p>Cursor leads for codebase-aware AI editing. Claude excels at complex reasoning tasks. GitHub Copilot is the most widely adopted.</p>
      <div class="highlight">Full directory: <a href="https://www.aimodelranks.live/tools" style="color:var(--cyan)">aimodelranks.live/tools</a></div>
      <p>Community votes and reviews help you find the right tool for your workflow.</p>`
  });

  return articles;
}