// Vercel Edge Function: Fetch AI model X posts via Nitter RSS
// Returns JSON array of latest posts from tracked accounts

export const config = { runtime: 'edge' };

const ACCOUNTS = [
  ['OpenAI', 'OpenAI'],
  ['AnthropicAI', 'Anthropic'],
  ['GoogleDeepMind', 'Google DeepMind'],
  ['Grok', 'Grok'],
  ['MistralAI', 'Mistral'],
  ['cohere', 'Cohere'],
  ['AIatMeta', 'Meta AI'],
  ['deepseek_ai', 'DeepSeek'],
  ['Alibaba_Qwen', 'Qwen']
];

const COLORS = {
  'OpenAI':'#00a67e','Anthropic':'#d4a574','Google DeepMind':'#4285f4',
  'Grok':'#ff6b35','Mistral':'#f97316','Cohere':'#8b5cf6',
  'Meta AI':'#0064e0','DeepSeek':'#4ade80','Qwen':'#f43f5e'
};

function parseRSS(text) {
  const posts = [];
  const items = text.split('<item>').slice(1);
  for (const item of items.slice(0, 2)) {
    const t = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || [,''])[1]
      .replace(/<[^>]*>/g,'').replace(/&apos;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
    if (!t) continue;
    const d = (item.match(/<dc:creator>(.*?)<\/dc:creator>/) || [,''])[1].replace('@','');
    const l = (item.match(/<link>(.*?)<\/link>/) || [,''])[1];
    const pdate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [,''])[1];
    posts.push({ text: t.length > 180 ? t.slice(0,177)+'...' : t, creator: d, url: l, time: pdate });
  }
  return posts;
}

export default async function handler() {
  try {
    const fetches = ACCOUNTS.map(([handle, label]) =>
      fetch(`https://nitter.net/${handle}/rss`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(4000)
      })
      .then(r => r.ok ? r.text() : null)
      .then(xml => {
        if (!xml) return [];
        return parseRSS(xml).map(p => ({
          text: p.text,
          account: label,
          handle,
          creator: p.creator,
          url: p.url,
          time: p.time,
          color: COLORS[label] || '#888'
        }));
      })
      .catch(() => [])
    );

    const results = await Promise.all(fetches);
    const posts = results.flat();

    // Shuffle for variety
    for (let i = posts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [posts[i], posts[j]] = [posts[j], posts[i]];
    }

    return new Response(JSON.stringify({ posts, count: posts.length }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=120, s-maxage=120'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ posts: [], count: 0, error: error.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });
  }
}
