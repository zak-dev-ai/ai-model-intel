#!/usr/bin/env node
/**
 * Daily AI Blog Article Generator
 * Generates static JSON for the blog page
 * Run daily via cron: 0 6 * * * cd /path && node scripts/generate-blog.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const MODELS_API = 'https://ai-model-intel.zak-media-ai.workers.dev/pricing';
const OUTPUT = path.join(__dirname, '..', 'static', 'blog-articles.json');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Parse error')); }
      });
    }).on('error', reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function generate() {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const today = new Date().toISOString().split('T')[0];
  const articles = [];
  
  let modelData = [];
  try { modelData = (await fetch(MODELS_API)).pricing || []; } catch {}
  
  let rssHeadlines = [];
  try {
    const text = await fetchText('https://hnrss.org/frontpage?count=10');
    const matches = text.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/g) || [];
    rssHeadlines = matches.slice(0, 5).map(m =>
      m.replace('<title><![CDATA[', '').replace(']]></title>', '')
    ).filter(h => !/^(Ask|Show) HN/.test(h));
  } catch {}

  if (modelData.length > 0) {
    const top3 = modelData.slice(0, 3);
    articles.push({
      _date: today, id: Date.now() + 1, cat: 'pricing', emoji: '💰', tag: 'PRICING',
      title: `AI Price Watch — ${dateStr}`,
      excerpt: `Cheapest: ${top3[0]?.model?.split(': ').pop() || 'N/A'} at $${top3[0]?.input_cost_per_mtok || '?'}/1M input.`,
      date: dateStr, read: '3 min', views: '0.8K',
      featured: false, isNew: true, isAI: true,
      bg: 'linear-gradient(135deg,#001a0a,#003018)',
      content: `<h2>Top Budget Models Today</h2>
        <div class="price-table">${top3.map(m => `<div class="price-row"><span>${m.model?.split(': ').pop() || m.model}</span><span class="pv">$${m.input_cost_per_mtok}/1M</span></div>`).join('')}</div>
        <div class="highlight">Route simple tasks to budget models ($0.02-0.05/1M). Save premium models for complex reasoning. This alone cuts API bills 60-80%.</div>
        <p>Full live rankings at <a href="https://www.aimodelranks.live/compare" style="color:var(--cyan)">aimodelranks.live</a> — 200+ models tracked.</p>`
    });
  }

  articles.push({
    _date: today, id: Date.now() + 2, cat: 'news', emoji: '📰', tag: 'AI NEWS',
    title: `AI Briefing — ${dateStr}`,
    excerpt: rssHeadlines.length > 0 ? rssHeadlines.slice(0, 2).join(', ').substring(0, 120) : 'AI industry updates.',
    date: dateStr, read: '3 min', views: '0.5K',
    featured: articles.length === 0, isNew: true, isAI: true,
    bg: 'linear-gradient(135deg,#001428,#002850)',
    content: `<h2>Today in AI</h2>
      ${rssHeadlines.length > 0
        ? rssHeadlines.map((h, i) => `<h2>${i+1}. ${h}</h2><p>Trending on Hacker News today.</p>`).join('')
        : '<p>AI pricing continues to drop. New models are being released at lower price points. Check aimodelranks.live for the latest data.</p>'}
      <div class="highlight">Bookmark <a href="https://www.aimodelranks.live" style="color:var(--cyan)">aimodelranks.live</a> for daily AI intelligence.</div>`
  });

  articles.push({
    _date: today, id: Date.now() + 3, cat: 'tools', emoji: '🛠', tag: 'AI TOOLS',
    title: `AI Tool Spotlight — ${dateStr}`,
    excerpt: 'Community-voted AI tools you should know about this week.',
    date: dateStr, read: '3 min', views: '0.6K',
    featured: false, isNew: true, isAI: false,
    bg: 'linear-gradient(135deg,#0a0a28,#1a1a50)',
    content: `<h2>This Week's Standouts</h2>
      <p>Browse and vote at <a href="https://www.aimodelranks.live/tools" style="color:var(--cyan)">aimodelranks.live/tools</a>.</p>
      <h2>Code Assistants</h2>
      <p>Cursor leads for codebase-aware AI editing. Claude excels at complex reasoning tasks. GitHub Copilot remains the most widely adopted.</p>
      <div class="highlight">Full directory: <a href="https://www.aimodelranks.live/tools" style="color:var(--cyan)">aimodelranks.live/tools</a> with 20+ tools and community voting.</div>`
  });

  fs.writeFileSync(OUTPUT, JSON.stringify({ articles }, null, 2));
  console.log(`✅ Generated ${articles.length} articles → static/blog-articles.json`);
}

generate().catch(e => { console.error('❌', e.message); process.exit(1); });
