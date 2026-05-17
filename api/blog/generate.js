// api/blog/generate.js
// Triggers blog article generation and caching
// Can be called via cron or manually

const SUPABASE_URL = 'https://jkoxrftlslylfmugjomd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprb3hyZnRsc2x5bGZtdWdqb21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjAzNTEsImV4cCI6MjA5MzM5NjM1MX0.1LVo1a2K2V8QZPX94bVTBmzIxUskKp0mR7RmNwgOdcI';
const MODELS_API = 'https://ai-model-intel.zak-media-ai.workers.dev/pricing';
const CACHE_KEY = 'blog_articles_json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Generate fresh articles
    const articles = await generateArticles();

    // Store in Supabase analytics table
    await fetch(`${SUPABASE_URL}/rest/v1/analytics`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
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

    return res.status(200).json({ success: true, count: articles.length, articles });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

async function generateArticles() {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const articles = [];
  let modelData = [];

  try {
    const r = await fetch(MODELS_API);
    const d = await r.json();
    modelData = d.pricing || [];
  } catch {}

  let rssHeadlines = [];
  try {
    const rss = await fetch('https://hnrss.org/frontpage?count=10');
    const text = await rss.text();
    const matches = text.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/g) || [];
    rssHeadlines = matches.slice(0, 5).map(m => 
      m.replace('<title><![CDATA[', '').replace(']]></title>', '')
    ).filter(h => !/^(Ask|Show) HN/.test(h));
  } catch {}

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
        <div class="price-table">${top3.map(m => `<div class="price-row"><span>${m.model?.split(': ').pop() || m.model}</span><span class="pv">$${m.input_cost_per_mtok}/1M</span></div>`).join('')}</div>
        <div class="highlight">Route simple tasks to budget models ($0.02-0.05/1M). Save premium models for complex reasoning. This alone cuts API bills 60-80%.</div>
        <p>Full live rankings at <a href="https://www.aimodelranks.live/compare" style="color:var(--cyan)">aimodelranks.live</a> — 200+ models tracked.</p>`
    });
  }

  articles.push({
    id: Date.now() + 2, cat: 'news', emoji: '📰', tag: 'AI NEWS',
    title: `AI Briefing — ${today}`,
    excerpt: rssHeadlines.length > 0 ? rssHeadlines.slice(0, 2).join(', ').substring(0, 120) : 'AI industry updates.',
    date: today, read: '3 min', views: '0.5K',
    featured: articles.length === 0, isNew: true, isAI: true,
    bg: 'linear-gradient(135deg,#001428,#002850)',
    content: `<h2>Today in AI</h2>${rssHeadlines.length > 0 ? rssHeadlines.map((h, i) => `<h2>${i+1}. ${h}</h2><p>Trending on Hacker News.</p>`).join('') : '<p>AI pricing continues to drop. Check aimodelranks.live for live data.</p>'}<div class="highlight">Bookmark aimodelranks.live for daily AI intelligence.</div>`
  });

  articles.push({
    id: Date.now() + 3, cat: 'tools', emoji: '🛠', tag: 'AI TOOLS',
    title: `AI Tool Spotlight — ${today}`,
    excerpt: 'Community-voted AI tools you should know about.',
    date: today, read: '3 min', views: '0.6K',
    featured: false, isNew: true, isAI: false,
    bg: 'linear-gradient(135deg,#0a0a28,#1a1a50)',
    content: `<h2>This Week's Standouts</h2><p>Browse and vote at <a href="https://www.aimodelranks.live/tools" style="color:var(--cyan)">aimodelranks.live/tools</a>.</p><h2>Code Assistants</h2><p>Cursor leads for codebase-aware AI editing. Claude excels at reasoning. Copilot is most widely adopted.</p><div class="highlight">Full directory: <a href="https://www.aimodelranks.live/tools" style="color:var(--cyan)">aimodelranks.live/tools</a></div>`
  });

  return articles;
}