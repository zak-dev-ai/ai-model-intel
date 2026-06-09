// Vercel Edge Function: Fetch AI model X posts via Nitter RSS
// Returns JSON array of latest posts from tracked accounts

export const config = { runtime: 'edge' };

const ACCOUNTS = [
  { handle: 'OpenAI', label: 'OpenAI' },
  { handle: 'AnthropicAI', label: 'Anthropic' },
  { handle: 'GoogleDeepMind', label: 'Google DeepMind' },
  { handle: 'Grok', label: 'Grok' },
  { handle: 'MistralAI', label: 'Mistral' },
  { handle: 'cohere', label: 'Cohere' },
  { handle: 'AIatMeta', label: 'Meta AI' },
  { handle: 'deepseek_ai', label: 'DeepSeek' },
  { handle: 'Alibaba_Qwen', label: 'Qwen' }
];

// Multiple Nitter mirrors for resilience
const MIRRORS = [
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.lucabased.xyz',
  'https://nitter.rawbit.ninja'
];

async function fetchWithFallback(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) return res;
    } catch (e) {
      // fall through to next attempt
    }
  }
  return null;
}

export default async function handler() {
  try {
    const posts = [];

    for (const account of ACCOUNTS) {
      let success = false;

      for (const mirror of MIRRORS) {
        if (success) break;
        const url = `${mirror}/${account.handle}/rss`;
        const res = await fetchWithFallback(url);
        if (!res || !res.ok) continue;

        const xml = await res.text();
        success = true;

        // Parse RSS XML — extract items with regex (lightweight, no parser dependency)
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let itemMatch;
        let count = 0;

        while ((itemMatch = itemRegex.exec(xml)) !== null && count < 3) {
          const item = itemMatch[1];

          const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
          const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s);
          const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
          const linkMatch = item.match(/<link>(.*?)<\/link>/);
          const creatorMatch = item.match(/<dc:creator>(.*?)<\/dc:creator>/);

          let text = titleMatch ? titleMatch[1] : '';
          // Clean HTML from text
          text = text.replace(/<[^>]*>/g, '').trim();
          // Truncate long posts
          if (text.length > 200) text = text.substring(0, 197) + '...';

          const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';
          const date = dateMatch ? dateMatch[1] : '';
          const link = linkMatch ? linkMatch[1] : `https://x.com/${account.handle}`;
          const creator = creatorMatch ? creatorMatch[1].replace('@', '') : account.handle;

          if (text) {
            posts.push({
              text,
              account: account.label,
              handle: account.handle,
              creator,
              time: date,
              url: link,
              id: `${account.handle}-${count}`
            });
            count++;
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
      }
    }

    return new Response(JSON.stringify({ posts, updated: new Date().toISOString() }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=120, s-maxage=120'
      }
    });

  } catch (error) {
    console.error('Ticker error:', error);
    return new Response(JSON.stringify({ posts: [], error: error.message, updated: new Date().toISOString() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });
  }
}
