// AI News Ticker — used on all pages
(function() {
  const ticker = document.getElementById('ai-ticker');
  const track = document.getElementById('tickerTrack');
  if (!ticker || !track) return;

  const ACCOUNTS = [
    ['OpenAI','OpenAI','#00a67e'],
    ['AnthropicAI','Anthropic','#d4a574'],
    ['GoogleDeepMind','Google DeepMind','#4285f4'],
    ['Grok','Grok','#ff6b35'],
    ['MistralAI','Mistral','#f97316'],
    ['cohere','Cohere','#8b5cf6'],
    ['AIatMeta','Meta AI','#0064e0'],
    ['deepseek_ai','DeepSeek','#4ade80'],
    ['Alibaba_Qwen','Qwen','#f43f5e']
  ];

  (async function load() {
    try {
      const results = await Promise.allSettled(
        ACCOUNTS.map(([handle]) =>
          fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://nitter.net/' + handle + '/rss'), { signal: AbortSignal.timeout(5000) })
            .then(r => r.ok ? r.json() : null)
        )
      );

      const posts = [];
      for (let i = 0; i < results.length; i++) {
        if (results[i].status !== 'fulfilled' || !results[i].value || results[i].value.status !== 'ok') continue;
        const [handle, label, color] = ACCOUNTS[i];
        for (const item of (results[i].value.items || []).slice(0, 2)) {
          if (!item.title) continue;
          const text = item.title.replace(/<[^>]*>/g,'').replace(/&apos;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
          posts.push({
            text: text.length > 180 ? text.slice(0,177)+'...' : text,
            account: label,
            url: item.link.replace('nitter.net/','x.com/').replace(/#m$/,''),
            color: color
          });
        }
      }

      if (posts.length < 3) return;

      // Shuffle
      for (let i = posts.length - 1; i > 0; i--) {
        const j = Math.random() * (i + 1) | 0;
        [posts[i], posts[j]] = [posts[j], posts[i]];
      }

      track.innerHTML = posts.map(p =>
        '<span class="feed-item" onclick="window.open(\''+p.url.replace(/'/g,'')+'\',\'_blank\')">' +
        '<span class="badge" style="color:'+p.color+';background:'+p.color+'15;border:1px solid '+p.color+'30">'+p.account+'</span>' +
        '<span class="text">'+p.text.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</span>' +
        '<span class="sep">•</span></span>'
      ).join('');

      // Duplicate for seamless loop
      track.innerHTML += track.innerHTML;
      ticker.style.display = 'block';
    } catch(e) {
      console.warn('Ticker:', e.message);
    }
  })();
})();
