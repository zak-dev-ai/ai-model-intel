/**
 * 🐙 OCTOPUS AI INTEL — Shared Ad System
 * ads.js — include in every page: /, /tools, /compare, /blog
 *
 * Reads from localStorage (works cross-page on same domain)
 * Admin can manage via /admin page
 * Auto-expires ads when time runs out
 * Rotates sidebar ads every 30 seconds
 */

const ADS_KEY = 'octopus_ads_v2';
const TOOLS_KEY = 'octopus_tools_v2';
const VOTED_KEY = 'octopus_voted_v2';
const SITE = 'https://www.aimodelranks.live';
const REF_TAG = '?ref=aimodelranks';

// ── OCTOPUS_CONFIG ────────────────────────────────────────────────────
window.OCTOPUS_CONFIG = {
  VOTED_KEY: VOTED_KEY,
  DODO: {
    starter: 'https://checkout.dodopayments.com/buy/pdt_0NeuDTWmUZGiP64pziSb4?quantity=1',
    growth: 'https://checkout.dodopayments.com/buy/pdt_0NeuDc4euvgNHtJJynMUM?quantity=1',
    featured: 'https://checkout.dodopayments.com/buy/pdt_0NeuDc4euvgNHtJJynMUM?quantity=1',
    premium: 'https://checkout.dodopayments.com/buy/pdt_0NeuDicfvBmy8ws9vVtag?quantity=1',
  },
  SLOT_PRICES: {
    1: '$99/mo', 2: '$49/mo', 3: '$49/mo',
    4: '$9/wk', 5: '$9/wk', 6: '$9/wk'
  },
  SLOT_PLANS: {
    1: 'premium', 2: 'growth', 3: 'growth',
    4: 'starter', 5: 'starter', 6: 'starter'
  },
  SLOT_DURATIONS: {
    1: '30d', 2: '30d', 3: '30d',
    4: '7d', 5: '7d', 6: '7d'
  },
  JOBS_PRICE: '$20/30d',
  BLOG_POST_PRICE: '$20/post'
};

// ── Default seed ads (shown when no paid ads exist) ──────────────────
const DEFAULT_ADS = [
  {
    id: 'default-1', slot: 1, filled: true,
    name: 'Mistral AI', desc: 'New Large 3 — $0.50/1M tokens. 60% cheaper than GPT-4o.',
    url: 'https://mistral.ai', image: 'https://icons.duckduckgo.com/ip3/mistral.ai.ico', emoji: '🔥', color: '#ff6b00',
    type: 'spotlight', plan: 'default', active: true, expiresAt: null,
  },
  {
    id: 'default-2', slot: 2, filled: true,
    name: 'Google Gemini', desc: '1M+ context window. Best price-to-performance.',
    url: 'https://ai.google.dev', image: 'https://icons.duckduckgo.com/ip3/google.com.ico', emoji: '✨', color: '#4285f4',
    type: 'spotlight', plan: 'default', active: true, expiresAt: null,
  },
  {
    id: 'default-3', slot: 3, filled: true,
    name: 'Anthropic Claude', desc: '200K context. Best quality for complex reasoning.',
    url: 'https://anthropic.com', image: 'https://icons.duckduckgo.com/ip3/anthropic.com.ico', emoji: '🤖', color: '#d05030',
    type: 'spotlight', plan: 'default', active: true, expiresAt: null,
  },
  {
    id: 'default-4', slot: 4, filled: true,
    name: 'DeepSeek', desc: 'Ultra-cheap AI chat — $0.14/1M tokens.',
    url: 'https://chat.deepseek.com', image: 'https://icons.duckduckgo.com/ip3/deepseek.com.ico', emoji: '🔍', color: '#4f46e5',
    type: 'spotlight', plan: 'default', active: true, expiresAt: null,
  },
  {
    id: 'default-5', slot: 5, filled: true,
    name: 'Llama AI', desc: 'Meta open-source LLM — free and powerful.',
    url: 'https://llama.meta.com', image: 'https://icons.duckduckgo.com/ip3/meta.com.ico', emoji: '🦙', color: '#00d97e',
    type: 'spotlight', plan: 'default', active: true, expiresAt: null,
  },
  {
    id: 'default-6', slot: 6, filled: true,
    name: 'Sora AI', desc: 'OpenAI text-to-video generation model.',
    url: 'https://openai.com/sora', image: 'https://icons.duckduckgo.com/ip3/openai.com.ico', emoji: '🎥', color: '#a855f7',
    type: 'spotlight', plan: 'default', active: true, expiresAt: null,
  },
  // Sidebar defaults
  {
    id: 'default-s1', name: 'Mistral AI',
    tagline: 'New Large 3 — $0.50/1M tokens. 60% cheaper than GPT-4o.',
    url: 'https://mistral.ai', logo: '🔥', color: '#ff6b00',
    image: 'https://icons.duckduckgo.com/ip3/mistral.ai.ico',
    type: 'sidebar', tier: 'default', active: true, expiresAt: null,
  },
  {
    id: 'default-s2', name: 'Google Gemini',
    tagline: '1M+ context window. Best price-to-performance.',
    url: 'https://ai.google.dev', logo: '✨', color: '#4285f4',
    image: 'https://icons.duckduckgo.com/ip3/google.com.ico',
    type: 'sidebar', tier: 'default', active: true, expiresAt: null,
  },
  {
    id: 'default-s3', name: 'Anthropic Claude',
    tagline: '200K context. Best quality for complex reasoning.',
    url: 'https://anthropic.com', logo: '🤖', color: '#d05030',
    image: 'https://icons.duckduckgo.com/ip3/anthropic.com.ico',
    type: 'sidebar', tier: 'default', active: true, expiresAt: null,
  },
];

// ── Ad Manager ────────────────────────────────────────────────────────
window.AdsManager = {
  // Load ads from localStorage, filter expired
  load() {
    try {
      const raw = localStorage.getItem(ADS_KEY);
      if (!raw) return DEFAULT_ADS.filter(a => a.filled !== undefined);
      const ads = JSON.parse(raw);
      const now = Date.now();
      const active = ads.filter(a => !a.expiresAt || a.expiresAt > now);
      if (active.length !== ads.length) this.save(active);
      // If no paid ads, return defaults for slots
      const paidSlots = active.filter(a => a.filled !== undefined && a.plan !== 'default');
      if (paidSlots.length === 0) return DEFAULT_ADS.filter(a => a.filled !== undefined);
      // Merge: paid ads override defaults by slot
      const defaults = DEFAULT_ADS.filter(a => a.filled !== undefined);
      const result = defaults.map(d => {
        const paid = active.find(a => a.slot === d.slot && a.plan !== 'default');
        return paid || d;
      });
      return result;
    } catch { return DEFAULT_ADS.filter(a => a.filled !== undefined); }
  },

  save(ads) {
    try { localStorage.setItem(ADS_KEY, JSON.stringify(ads)); } catch {}
  },

  add(ad) {
    const ads = this.load().filter(a => a.plan !== 'default');
    ads.push(ad);
    this.save(ads);
  },

  byType(type) {
    try {
      const raw = localStorage.getItem(ADS_KEY);
      const all = raw ? JSON.parse(raw) : [];
      const paid = all.filter(a => a.type === type && a.active && a.tier !== 'default');
      if (paid.length > 0) return paid;
    } catch {}
    return DEFAULT_ADS.filter(a => a.type === type);
  },

  sidebar() { return this.byType('sidebar'); },
  spotlight() { return this.load().filter(a => a.slot && a.filled); },
  strip() { return this.byType('spotlight'); },

  stats() {
    try {
      const raw = localStorage.getItem(ADS_KEY);
      const all = raw ? JSON.parse(raw).filter(a => a.tier && a.tier !== 'default') : [];
      return {
        total: all.length,
        sidebar: all.filter(a => a.type === 'sidebar').length,
        spotlight: all.filter(a => a.type === 'spotlight').length,
        strip: all.filter(a => a.type === 'strip').length,
        sidebarFree: Math.max(0, 9 - all.filter(a => a.type === 'sidebar').length),
        slotsFree: Math.max(0, 6 - this.load().filter(a => a.plan !== 'default').length),
        spotFree: Math.max(0, 12 - all.filter(a => a.type === 'spotlight').length),
        stripFree: Math.max(0, 3 - all.filter(a => a.type === 'strip').length),
      };
    } catch { return { total: 0, sidebar: 0, spotlight: 0, strip: 0, sidebarFree: 9, slotsFree: 6, spotFree: 12, stripFree: 3 }; }
  },

  isFull(type) {
    const limits = { sidebar: 9, spotlight: 12, strip: 3 };
    try {
      const raw = localStorage.getItem(ADS_KEY);
      const ads = raw ? JSON.parse(raw).filter(a => a.type === type && a.tier !== 'default') : [];
      return ads.length >= (limits[type] || 9);
    } catch { return false; }
  },

  onPaymentSuccess(planId, buyerData) {
    const durations = { starter: 7, growth: 30, premium: 30 };
    const days = durations[planId] || 7;
    // Find next available slot
    const existing = this.load().filter(a => a.plan !== 'default');
    const usedSlots = new Set(existing.map(a => a.slot));
    let slot = 0;
    for (let i = 1; i <= 6; i++) { if (!usedSlots.has(i)) { slot = i; break; } }
    if (!slot) slot = 6; // fallback
    const newAd = {
      id: 'paid-' + Date.now(),
      slot: slot,
      filled: true,
      name: buyerData.toolName,
      desc: buyerData.tagline,
      url: buyerData.url,
      emoji: buyerData.emoji || '🚀',
      color: buyerData.color || '#3bb4ff',
      cta: buyerData.cta || 'Visit →',
      type: planId === 'premium' ? 'strip' : (planId === 'growth' ? 'spotlight' : 'spotlight'),
      tier: planId,
      plan: planId,
      active: true,
      expiresAt: Date.now() + (days * 86400000),
      buyerEmail: buyerData.email,
      purchasedAt: new Date().toISOString(),
    };
    this.add(newAd);
    return newAd;
  },

  renderSidebarCard(ad) {
    return `
    <div class="ad-card" style="border-radius:10px;overflow:hidden;border:1px solid var(--border);transition:border-color 0.2s,transform 0.2s;">
      <div style="height:3px;background:linear-gradient(90deg,${ad.color},${ad.color}88)"></div>
      <div style="padding:16px;background:var(--bg2)">
        <div style="display:inline-block;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.15);color:var(--yellow);font-size:10px;padding:2px 7px;border-radius:3px;font-family:var(--mono);margin-bottom:8px">SPONSORED</div>
        <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">${ad.logo} ${ad.name}</div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.5">${ad.tagline || ad.desc}</div>
        <a href="${ad.url}${REF_TAG}" target="_blank" rel="noopener"
          style="display:block;text-align:center;padding:9px;border-radius:7px;font-size:13px;font-weight:700;text-decoration:none;background:${ad.color};color:#fff;transition:opacity 0.2s"
          onmouseover="this.style.opacity=0.85" onmouseout="this.style.opacity=1">
          Visit ${ad.name} →
        </a>
      </div>
    </div>`;
  },

  startRotation(containerId, intervalMs = 30000) {
    const ads = this.sidebar();
    if (!ads.length) return;
    let idx = 0;
    const el = document.getElementById(containerId);
    if (!el) return;
    const show = () => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        el.innerHTML = this.renderSidebarCard(ads[idx]);
        el.style.opacity = '1';
        idx = (idx + 1) % ads.length;
      }, 500);
    };
    show();
    return setInterval(show, intervalMs);
  },

  // Find free slot for plan (for post-pay form)
  freeSlotForPlan(plan) {
    const occupied = this.load().filter(a => a.plan !== 'default').map(a => a.slot);
    const available = [1,2,3,4,5,6].filter(s => !occupied.includes(s));
    if (available.length === 0) return null;
    if (plan === 'premium') return available[0];
    if (plan === 'growth') return available[Math.min(1, available.length-1)];
    return available[Math.min(2, available.length-1)];
  },

  // Activate an ad slot (called from post-pay form)
  activateAd(data) {
    const durations = { starter: 7, growth: 30, premium: 30 };
    const days = durations[data.plan] || 7;
    const slot = this.freeSlotForPlan(data.plan);
    if (!slot) return null;
    const newAd = {
      id: 'paid-' + Date.now(),
      slot: slot,
      filled: true,
      name: data.name,
      desc: data.desc,
      url: data.url,
      emoji: data.emoji || '🚀',
      color: data.color || '#a855f7',
      cta: data.cta || 'Visit →',
      image: data.image || (data.url ? (function(){try{return 'https://icons.duckduckgo.com/ip3/'+new URL(data.url).hostname+'.ico'}catch(e){return ''}})() : ''),
      type: data.plan === 'premium' ? 'strip' : 'spotlight',
      tier: data.plan,
      plan: data.plan,
      active: true,
      expiresAt: Date.now() + (days * 86400000),
      buyerEmail: data.email,
      purchasedAt: new Date().toISOString(),
    };
    this.add(newAd);
    return newAd;
  },

  // Send email confirmation (uses mailto fallback)
  sendConfirmation(ad) {
    const days = Math.ceil((ad.expiresAt - Date.now()) / 86400000);
    const subj = encodeURIComponent(`Your ad is LIVE on aimodelranks.live — Slot ${ad.slot}`);
    const body = encodeURIComponent(
      `Hi there,\n\nYour ad for ${ad.name} is now live at:\nhttps://www.aimodelranks.live/tools\n\nSlot: #${ad.slot}\nPlan: ${ad.plan}\nExpires: ${new Date(ad.expiresAt).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'})}\n${days} days remaining\n\nNeed changes? Reply to this email.\n\n— aimodelranks.live team`
    );
    if (ad.buyerEmail) {
      window.open(`mailto:${ad.buyerEmail}?subject=${subj}&body=${body}`);
    }
  },
};

// ── Tools DB (shared across pages) ──────────────────────────────────
window.ToolsDB = {
  defaults: [
    {id:1,name:'Midjourney',emoji:'🎨',cat:'image',pricing:'paid',tagline:'AI image generation creating stunning artistic visuals from text prompts.',votes:2847,featured:true,url:'https://midjourney.com',daysAgo:120,approved:true,image:'https://icons.duckduckgo.com/ip3/midjourney.com.ico'},
    {id:2,name:'ChatGPT',emoji:'💬',cat:'chat',pricing:'freemium',tagline:"OpenAI's conversational AI for writing, coding, analysis and more.",votes:5230,featured:true,url:'https://chatgpt.com',daysAgo:180,approved:true,image:'https://icons.duckduckgo.com/ip3/chatgpt.com.ico'},
    {id:3,name:'Cursor',emoji:'💻',cat:'coding',pricing:'freemium',tagline:'AI-powered code editor that understands your entire codebase.',votes:1923,featured:true,url:'https://cursor.sh',daysAgo:60,approved:true,image:'https://icons.duckduckgo.com/ip3/cursor.sh.ico'},
    {id:4,name:'Claude',emoji:'🤖',cat:'chat',pricing:'freemium',tagline:"Anthropic's AI assistant for analysis, writing and reasoning.",votes:1654,featured:false,url:'https://claude.ai',daysAgo:90,approved:true,image:'https://icons.duckduckgo.com/ip3/claude.ai.ico'},
    {id:5,name:'Runway Gen-4',emoji:'🎬',cat:'video',pricing:'freemium',tagline:'State-of-the-art AI video generation from text or image.',votes:1432,featured:true,url:'https://runwayml.com',daysAgo:7,approved:true,image:'https://icons.duckduckgo.com/ip3/runwayml.com.ico'},
    {id:6,name:'ElevenLabs',emoji:'🎵',cat:'audio',pricing:'freemium',tagline:'Ultra-realistic AI voice cloning and text-to-speech.',votes:1876,featured:false,url:'https://elevenlabs.io',daysAgo:150,approved:true,image:'https://icons.duckduckgo.com/ip3/elevenlabs.io.ico'},
    {id:7,name:'Perplexity AI',emoji:'🔬',cat:'research',pricing:'freemium',tagline:'AI-powered search engine that cites its sources.',votes:2341,featured:false,url:'https://perplexity.ai',daysAgo:130,approved:true,image:'https://icons.duckduckgo.com/ip3/perplexity.ai.ico'},
    {id:8,name:'GitHub Copilot',emoji:'🐙',cat:'coding',pricing:'paid',tagline:'AI pair programmer for code completions in real time.',votes:3102,featured:false,url:'https://github.com/features/copilot',daysAgo:200,approved:true,image:'https://icons.duckduckgo.com/ip3/github.com.ico'},
    {id:9,name:'Notion AI',emoji:'⚡',cat:'productivity',pricing:'freemium',tagline:'AI writing assistant built into Notion workspace.',votes:1543,featured:false,url:'https://notion.so',daysAgo:110,approved:true,image:'https://icons.duckduckgo.com/ip3/notion.so.ico'},
    {id:10,name:'DALL-E 3',emoji:'🖼️',cat:'image',pricing:'freemium',tagline:'OpenAI image generation via ChatGPT Plus.',votes:987,featured:false,url:'https://openai.com/dall-e-3',daysAgo:140,approved:true,image:'https://icons.duckduckgo.com/ip3/chatgpt.com.ico'},
    {id:11,name:'Stable Diffusion',emoji:'🎭',cat:'image',pricing:'free',tagline:'Open source image generation you can run locally.',votes:2654,featured:false,url:'https://stability.ai',daysAgo:220,approved:true,image:'https://icons.duckduckgo.com/ip3/stability.ai.ico'},
    {id:12,name:'Sora',emoji:'🎥',cat:'video',pricing:'freemium',tagline:"OpenAI's text-to-video AI model.",votes:2109,featured:true,url:'https://openai.com/sora',daysAgo:5,approved:true,image:'https://icons.duckduckgo.com/ip3/chatgpt.com.ico'},
    {id:13,name:'Mistral AI',emoji:'🔥',cat:'chat',pricing:'free',tagline:"Chat with Mistral's powerful open-weight models.",votes:654,featured:false,url:'https://chat.mistral.ai',daysAgo:6,approved:true,image:'https://icons.duckduckgo.com/ip3/mistral.ai.ico'},
    {id:14,name:'DeepSeek',emoji:'🔍',cat:'chat',pricing:'free',tagline:'Ultra-cheap AI chat — $0.14/1M tokens.',votes:1876,featured:false,url:'https://chat.deepseek.com',daysAgo:4,approved:true,image:'https://icons.duckduckgo.com/ip3/deepseek.com.ico'},
    {id:15,name:'Figma AI',emoji:'🖌️',cat:'design',pricing:'freemium',tagline:'AI features in the most popular design tool.',votes:1234,featured:false,url:'https://figma.com',daysAgo:45,approved:true,image:'https://icons.duckduckgo.com/ip3/figma.com.ico'},
    {id:16,name:'Devin AI',emoji:'🤖',cat:'coding',pricing:'paid',tagline:'The first fully autonomous AI software engineer.',votes:1432,featured:false,url:'https://devin.ai',daysAgo:30,approved:true,image:'https://icons.duckduckgo.com/ip3/devin.ai.ico'},
    {id:17,name:'Jasper AI',emoji:'✍️',cat:'writing',pricing:'paid',tagline:'AI marketing copy and content writing for brands.',votes:876,featured:false,url:'https://jasper.ai',daysAgo:160,approved:true,image:'https://icons.duckduckgo.com/ip3/jasper.ai.ico'},
    {id:18,name:'Anthropic',emoji:'🧠',cat:'research',pricing:'freemium',tagline:'Advanced AI safety research and model development.',votes:543,featured:false,url:'https://anthropic.com',daysAgo:90,approved:true,image:'https://icons.duckduckgo.com/ip3/claude.ai.ico'},
    {id:19,name:'HubSpot AI',emoji:'📢',cat:'marketing',pricing:'freemium',tagline:'AI marketing automation and content generation.',votes:432,featured:false,url:'https://hubspot.com',daysAgo:70,approved:true,image:'https://icons.duckduckgo.com/ip3/hubspot.com.ico'},
    {id:20,name:'Replit AI',emoji:'⚡',cat:'coding',pricing:'freemium',tagline:'AI-powered code generation and deployment platform.',votes:876,featured:false,url:'https://replit.com',daysAgo:50,approved:true,image:'https://icons.duckduckgo.com/ip3/replit.com.ico'},
    {id:21,name:'Canva AI',emoji:'🎨',cat:'design',pricing:'freemium',tagline:'AI-powered design tools for creating visual content.',votes:1543,featured:false,url:'https://canva.com',daysAgo:30,approved:true,image:'https://icons.duckduckgo.com/ip3/canva.com.ico'},
    {id:22,name:'Google Gemini',emoji:'✨',cat:'chat',pricing:'free',tagline:'Google\'s multimodal AI with 1M+ token context.',votes:2341,featured:false,url:'https://gemini.google.com',daysAgo:15,approved:true,image:'https://icons.duckduckgo.com/ip3/gemini.google.com.ico'},
    {id:23,name:'Copilot',emoji:'💡',cat:'productivity',pricing:'freemium',tagline:'Microsoft\'s AI companion across Office and Windows.',votes:987,featured:false,url:'https://copilot.microsoft.com',daysAgo:20,approved:true,image:'https://icons.duckduckgo.com/ip3/microsoft.com.ico'},
    {id:24,name:'Llama AI',emoji:'🦙',cat:'chat',pricing:'free',tagline:'Meta\'s open-source LLM family — free and powerful.',votes:1654,featured:false,url:'https://llama.meta.com',daysAgo:10,approved:true,image:'https://icons.duckduckgo.com/ip3/meta.com.ico'},
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

  save(tools) {
    try { localStorage.setItem(TOOLS_KEY, JSON.stringify(tools)); } catch {}
  },

  add(tool) {
    const tools = this.load();
    const newId = Math.max(...tools.map(t => t.id), 0) + 1;
    const newTool = {
      ...tool,
      id: newId,
      votes: 0,
      approved: true,
      daysAgo: 0,
      image: tool.image || (tool.url ? `https://img.logo.dev/${new URL(tool.url).hostname}?token=pk_public&size=128` : ''),
      submittedAt: new Date().toISOString(),
    };
    tools.unshift(newTool);
    this.save(tools);
    return newTool;
  },

  vote(id) {
    const tools = this.load();
    const t = tools.find(x => x.id === id);
    if (t) { t.votes++; this.save(tools); }
  },

  count() { return this.load().length; },
};

// ── Global REFERRAL_MAP for partner links ───────────────────────────
window.REFERRAL_MAP = window.REFERRAL_MAP || {
  'Midjourney': 'https://midjourney.com?ref=aimodelranks',
  'ChatGPT': 'https://chatgpt.com?ref=aimodelranks',
  'Cursor': 'https://cursor.sh?ref=aimodelranks',
  'Claude': 'https://claude.ai?ref=aimodelranks',
  'Runway Gen-4': 'https://runwayml.com?ref=aimodelranks',
  'ElevenLabs': 'https://elevenlabs.io?ref=aimodelranks',
  'Perplexity AI': 'https://perplexity.ai?ref=aimodelranks',
  'GitHub Copilot': 'https://github.com/features/copilot?ref=aimodelranks',
  'Notion AI': 'https://notion.so?ref=aimodelranks',
  'DALL-E 3': 'https://openai.com/dall-e-3?ref=aimodelranks',
  'Stable Diffusion':'https://stability.ai?ref=aimodelranks',
  'Sora': 'https://openai.com/sora?ref=aimodelranks',
  'Mistral AI': 'https://chat.mistral.ai?ref=aimodelranks',
  'DeepSeek': 'https://chat.deepseek.com?ref=aimodelranks',
  'Figma AI': 'https://figma.com?ref=aimodelranks',
  'Devin AI': 'https://devin.ai?ref=aimodelranks',
  'Jasper AI': 'https://jasper.ai?ref=aimodelranks',
  'Anthropic': 'https://anthropic.com?ref=aimodelranks',
  'HubSpot AI': 'https://hubspot.com?ref=aimodelranks',
  'Replit AI': 'https://replit.com?ref=aimodelranks',
  'Canva AI': 'https://canva.com?ref=aimodelranks',
  'Google Gemini': 'https://gemini.google.com?ref=aimodelranks',
  'Copilot': 'https://copilot.microsoft.com?ref=aimodelranks',
  'Llama AI': 'https://llama.meta.com?ref=aimodelranks',
};


// ── Image fallback handler ────────────────────────────────────────
window.fixBrokenImage = function(img) {
  img.onerror = function() {
    const card = img.closest('.ht-card, .tool-card, .tc, .scard');
    const emoji = card ? (card.querySelector('.ht-name, .tc-name, .sp-name, .sc-name')?.textContent?.charAt(0) || '🤖') : '🤖';
    img.style.display = 'none';
    const fallback = img.nextElementSibling;
    if (fallback && fallback.classList.contains('ht-img-fallback')) {
      fallback.style.display = 'flex';
    }
    img.onerror = null;
  };
};

// ── Referral URL builder ─────────────────────────────────────────────
window.buildRefURL = function(tool) {
  if (window.REFERRAL_MAP && window.REFERRAL_MAP[tool.name]) {
    return window.REFERRAL_MAP[tool.name];
  }
  const url = tool.url || '';
  const sep = url.includes('?') ? '&' : '?';
  return url + sep + 'ref=aimodelranks';
};

// ── Scam checker ─────────────────────────────────────────────────────
window.scamCheck = function(name, url, desc) {
  if (!url.startsWith('http')) return { pass: false, reason: 'URL must start with https://' };
  if (!url.includes('.')) return { pass: false, reason: 'Invalid domain' };
  const combined = (name + ' ' + url + ' ' + desc).toLowerCase();
  const banned = ['free money','earn $','guaranteed income','click to win','crypto scam','nft drop','mlm','pyramid scheme','make money fast'];
  for (const b of banned) {
    if (combined.includes(b)) return { pass: false, reason: 'Flagged: contains "' + b + '"' };
  }
  const suspicious = ['.xyz', 'free-', '-free', 'earn-', 'money-'];
  for (const s of suspicious) {
    if (url.includes(s)) return { pass: false, reason: 'Suspicious domain pattern' };
  }
  return { pass: true };
};

// ── Auto-expiry watcher ──────────────────────────────────────────────
// Runs on every page load to clean expired ads
(function() {
  try {
    const raw = localStorage.getItem(ADS_KEY);
    if (raw) {
      const ads = JSON.parse(raw);
      const now = Date.now();
      const before = ads.length;
      const active = ads.filter(a => !a.expiresAt || a.expiresAt > now);
      if (active.length !== before) {
        localStorage.setItem(ADS_KEY, JSON.stringify(active));
      }
    }
  } catch(e) {}
})();



// ── Global image error handler ────────────────────────────────────
window.setupImgFallback = function(img) {
  img.onerror = function() {
    const card = img.closest('[data-emoji]');
    const emoji = card ? card.getAttribute('data-emoji') : '🤖';
    const span = document.createElement('span');
    span.style.cssText = 'font-size:40px;line-height:1;display:block;text-align:center';
    span.textContent = emoji;
    img.parentNode.replaceChild(span, img);
  };
};

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.ht-img, .tc-img, .scard-img, img[src*="logo.dev"], img[src*="duckduckgo"]').forEach(window.setupImgFallback);
});

var _pv=parseInt(localStorage.getItem("octopus_pv")||0);localStorage.setItem("octopus_pv",_pv+1);
// ── Supabase Analytics Tracking ──────────────────────────────────
(function() {
  const SUPABASE_URL = 'https://jkoxrftlslylfmugjomd.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprb3hyZnRsc2x5bGZtdWdqb21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjAzNTEsImV4cCI6MjA5MzM5NjM1MX0.1LVo1a2K2V8QZPX94bVTBmzIxUskKp0mR7RmNwgOdcI';
  
  try {
    fetch(SUPABASE_URL + '/rest/v1/analytics', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': 'Bearer ' + SUPABASE_ANON,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        event: 'pageview',
        page: window.location.pathname,
        value: 1,
        created_at: new Date().toISOString()
      })
    }).catch(() => {});
  } catch(e) {}
})();
