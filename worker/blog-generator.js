/**
 * 🐙 Octopus AI Intel — Blog Content Generator
 * 
 * Deployed as a Cloudflare Worker.
 * Generates daily AI blog posts using:
 * - RSS/web sources for recent AI news
 * - OpenRouter/Perplexity API for content generation
 * 
 * Endpoints:
 *   GET /blog/articles          — Returns all stored articles
 *   POST /blog/generate         — Triggers one new article (manual)
 *   GET /blog/refresh            — Checks for new content & generates if needed
 * 
 * Cron trigger: runs daily at 06:00 UTC
 */

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';
const SUPABASE_URL = 'https://jkoxrftlslylfmugjomd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprb3hyZnRsc2x5bGZtdWdqb21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjAzNTEsImV4cCI6MjA5MzM5NjM1MX0.1LVo1a2K2V8QZPX94bVTBmzIxUskKp0mR7RmNwgOdcI';

// Categories to rotate through
const CATEGORIES = ['models', 'pricing', 'tools', 'news'];
const CAT_NAMES = {
  models: { tag: 'MODEL LAUNCH', emoji: '🤖' },
  pricing: { tag: 'PRICING', emoji: '💰' },
  tools: { tag: 'AI TOOLS', emoji: '🛠' },
  news: { tag: 'AI NEWS', emoji: '📰' },
};

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: { ...headers, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': '*' } });
    }

    try {
      if (path === '/blog/articles') {
        const articles = await getArticles(env);
        return new Response(JSON.stringify({ articles }), { headers });
      }

      if (path === '/blog/generate' && req.method === 'POST') {
        const article = await generateArticle(env);
        return new Response(JSON.stringify({ success: true, article }), { headers });
      }

      if (path === '/blog/refresh') {
        const result = await checkAndGenerate(env);
        return new Response(JSON.stringify(result), { headers });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  },

  // Cron trigger — runs daily
  async scheduled(event, env) {
    await checkAndGenerate(env);
  }
};

async function getArticles(env) {
  const stored = await env.KV.get('blog_articles', 'json');
  return stored || [];
}

async function checkAndGenerate(env) {
  const articles = await getArticles(env);
  const lastDate = articles.length > 0 ? articles[0].date : null;
  const today = new Date().toISOString().split('T')[0];

  // Generate new article if today's post doesn't exist
  if (lastDate !== today) {
    const article = await generateArticle(env);
    return { generated: true, article };
  }

  return { generated: false, message: 'Already have today\'s article' };
}

async function generateArticle(env) {
  // Get existing articles to determine next category
  const articles = await getArticles(env);
  const lastCat = articles.length > 0 ? articles[0].cat : null;
  const cats = Object.keys(CATEGORIES);
  const lastIdx = cats.indexOf(lastCat);
  const nextCat = cats[(lastIdx + 1) % cats.length];
  
  const catInfo = CAT_NAMES[nextCat];
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  // Fetch recent AI news for context
  const newsContext = await fetchAIDailyBrief();

  // Generate article using OpenRouter
  const article = await generateWithLLM(nextCat, catInfo, newsContext, today, env);

  // Save to KV (prepend to array, keep max 20)
  articles.unshift(article);
  const trimmed = articles.slice(0, 20);
  await env.KV.put('blog_articles', JSON.stringify(trimmed));

  return article;
}

async function fetchAIDailyBrief() {
  try {
    const rssFeeds = [
      'https://rss.arxiv.org/rss/cs.AI',
      'https://hnrss.org/frontpage',
    ];

    const results = await Promise.allSettled(
      rssFeeds.map(url => fetch(url).then(r => r.text()).catch(() => ''))
    );

    const lines = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const text = result.value.substring(0, 3000);
        lines.push(text);
      }
    }

    return lines.join('\n').substring(0, 5000);
  } catch {
    return '';
  }
}

async function generateWithLLM(cat, catInfo, newsContext, today, env) {
  const systemPrompt = `You are a tech journalist covering AI, and you work for aimodelranks.live.

Write a blog post about AI ${cat === 'models' ? 'model' : cat === 'tools' ? 'tools' : cat === 'pricing' ? 'pricing' : 'news'}.

Return ONLY valid JSON with this structure (no markdown, no backticks):
{
  "title": "Compelling headline under 80 chars",
  "excerpt": "One sentence summary under 120 chars",
  "content": "Full article with 3-4 sections. Use <p> and <h2> tags. Include one <div class=\"highlight\"> callout box. Keep it 300-600 words. Link to aimodelranks.live naturally.",
  "read": "X min",
  "views": "X.XK",
  "featured": false,
  "isNew": true,
  "isAI": true
}`;

  const userPrompt = `Write a ${cat} blog post for today (${today}).
${
  cat === 'models' ? 'Focus on a recently released AI model. Include pricing, context window, and a use case.' :
  cat === 'tools' ? 'Focus on an AI tool developers should know about. Include features and pricing if available.' :
  cat === 'pricing' ? 'Focus on recent pricing changes or cost optimization strategies for AI APIs.' :
  'Write about a current trend or news in AI.'
}
${newsContext ? 'Recent context (use if relevant):\n' + newsContext.substring(0, 3000) : ''}

Return ONLY valid JSON.`;

  try {
    const res = await fetch(OPENROUTER_API, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.OPENROUTER_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })
    });

    const data = await res.json();
    const responseText = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]);

    // Assign IDs and metadata
    const articles = await getArticles(env);
    const maxId = articles.reduce((m, a) => Math.max(m, a.id || 0), 0);

    const bgColors = [
      'linear-gradient(135deg,#0a1628,#1a2850)',
      'linear-gradient(135deg,#001a0a,#003018)',
      'linear-gradient(135deg,#0a0a28,#1a1a50)',
      'linear-gradient(135deg,#1a0a28,#300a50)',
      'linear-gradient(135deg,#001428,#002850)',
      'linear-gradient(135deg,#2d0a00,#4a1800)',
    ];

    return {
      id: maxId + 1,
      cat: cat,
      emoji: catInfo.emoji,
      tag: catInfo.tag,
      title: parsed.title,
      excerpt: parsed.excerpt,
      date: today,
      read: parsed.read || '5 min',
      views: parsed.views || '0.5K',
      featured: articles.length === 0, // First article is featured
      isNew: true,
      isAI: true,
      bg: bgColors[(maxId + 1) % bgColors.length],
      content: parsed.content,
    };
  } catch (e) {
    // Fallback: return a simple article
    return {
      id: Date.now(),
      cat: cat,
      emoji: catInfo.emoji,
      tag: catInfo.tag,
      title: `${catInfo.emoji} ${cat === 'models' ? 'AI Model Update' : cat === 'pricing' ? 'AI Pricing Update' : cat === 'tools' ? 'AI Tool Spotlight' : 'AI News Brief'} — ${today}`,
      excerpt: `Latest updates in AI ${cat}. Check aimodelranks.live for live pricing comparisons.`,
      date: today,
      read: '3 min',
      views: '0.1K',
      featured: false,
      isNew: true,
      isAI: true,
      bg: 'linear-gradient(135deg,#0a1628,#1a2850)',
      content: `<h2>Latest ${catInfo.tag}</h2><p>New AI ${cat} updates for ${today}. Check <a href="https://www.aimodelranks.live/compare" style="color:var(--cyan)">aimodelranks.live</a> for live pricing and model comparisons.</p><div class="highlight">Visit aimodelranks.live for real-time AI model pricing across 200+ models and 8 providers.</div><h2>Why This Matters</h2><p>The AI landscape changes fast. Stay updated with daily coverage at aimodelranks.live.</p>`,
    };
  }
}
