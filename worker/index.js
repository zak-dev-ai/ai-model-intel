/**
 * 🐙 OCTOPUS AI MODEL INTEL — v2.1
 * Decision Intelligence Platform
 * Updated: April 2026 — Full Mistral lineup + all missing models
 */

// ── Complete verified model database (April 2026) ─────────────────────
const SEED_MODELS = [

  // ── OpenAI ──────────────────────────────────────────────────────────
  { provider:"openai", model:"gpt-4o",              input_cost_per_mtok:2.50,  output_cost_per_mtok:10.00, context_window:128000,  release_date:"2024-05-13", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Flagship multimodal model" },
  { provider:"openai", model:"gpt-4o-mini",          input_cost_per_mtok:0.15,  output_cost_per_mtok:0.60,  context_window:128000,  release_date:"2024-07-18", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Fast and affordable" },
  { provider:"openai", model:"gpt-4-turbo",          input_cost_per_mtok:10.00, output_cost_per_mtok:30.00, context_window:128000,  release_date:"2024-04-09", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Predecessor to GPT-4o" },
  { provider:"openai", model:"gpt-3.5-turbo",        input_cost_per_mtok:0.50,  output_cost_per_mtok:1.50,  context_window:16385,   release_date:"2022-11-30", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Legacy, widely used" },
  { provider:"openai", model:"o1",                   input_cost_per_mtok:15.00, output_cost_per_mtok:60.00, context_window:200000,  release_date:"2024-12-17", status:"ga",      supports_vision:true,  supports_functions:false, notes:"Advanced reasoning" },
  { provider:"openai", model:"o1-mini",              input_cost_per_mtok:3.00,  output_cost_per_mtok:12.00, context_window:128000,  release_date:"2024-09-12", status:"ga",      supports_vision:false, supports_functions:false, notes:"Compact reasoning model" },
  { provider:"openai", model:"o3-mini",              input_cost_per_mtok:1.10,  output_cost_per_mtok:4.40,  context_window:200000,  release_date:"2025-01-31", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Cost-efficient reasoning" },
  { provider:"openai", model:"o3",                   input_cost_per_mtok:2.00,  output_cost_per_mtok:8.00,  context_window:200000,  release_date:"2025-04-16", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Latest OpenAI reasoning flagship" },
  { provider:"openai", model:"gpt-4.1",              input_cost_per_mtok:2.00,  output_cost_per_mtok:8.00,  context_window:1047576, release_date:"2025-04-14", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"GPT-4.1 with 1M context" },
  { provider:"openai", model:"gpt-4.1-mini",         input_cost_per_mtok:0.40,  output_cost_per_mtok:1.60,  context_window:1047576, release_date:"2025-04-14", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Affordable GPT-4.1 variant" },
  { provider:"openai", model:"gpt-4.1-nano",         input_cost_per_mtok:0.10,  output_cost_per_mtok:0.40,  context_window:1047576, release_date:"2025-04-14", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Ultra-cheap GPT-4.1" },

  // ── Anthropic ────────────────────────────────────────────────────────
  { provider:"anthropic", model:"claude-sonnet-4-5", input_cost_per_mtok:3.00,  output_cost_per_mtok:15.00, context_window:200000,  release_date:"2025-07-22", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Latest Claude Sonnet" },
  { provider:"anthropic", model:"claude-3-5-sonnet-20241022", input_cost_per_mtok:3.00,  output_cost_per_mtok:15.00, context_window:200000,  release_date:"2024-10-22", status:"ga", supports_vision:true, supports_functions:true, notes:"Best overall Anthropic model" },
  { provider:"anthropic", model:"claude-3-5-haiku-20241022",  input_cost_per_mtok:0.80,  output_cost_per_mtok:4.00,  context_window:200000,  release_date:"2024-11-05", status:"ga", supports_vision:true, supports_functions:true, notes:"Fastest Anthropic model" },
  { provider:"anthropic", model:"claude-3-opus-20240229",     input_cost_per_mtok:15.00, output_cost_per_mtok:75.00, context_window:200000,  release_date:"2024-02-29", status:"ga", supports_vision:true, supports_functions:true, notes:"Most powerful Claude 3" },
  { provider:"anthropic", model:"claude-3-haiku-20240307",    input_cost_per_mtok:0.25,  output_cost_per_mtok:1.25,  context_window:200000,  release_date:"2024-03-07", status:"ga", supports_vision:true, supports_functions:true, notes:"Fastest Claude 3" },

  // ── Google ───────────────────────────────────────────────────────────
  { provider:"google", model:"gemini-2.5-pro",    input_cost_per_mtok:1.25,  output_cost_per_mtok:5.00,  context_window:1048576, release_date:"2025-03-25", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"1M context, thinking model" },
  { provider:"google", model:"gemini-2.5-flash",  input_cost_per_mtok:0.15,  output_cost_per_mtok:0.60,  context_window:1048576, release_date:"2025-05-01", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Fast Gemini 2.5 variant" },
  { provider:"google", model:"gemini-2.0-flash",  input_cost_per_mtok:0.10,  output_cost_per_mtok:0.40,  context_window:1048576, release_date:"2025-02-05", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Fast and cheap 1M context" },
  { provider:"google", model:"gemini-1.5-pro",    input_cost_per_mtok:1.25,  output_cost_per_mtok:5.00,  context_window:2097152, release_date:"2024-05-24", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"2M token context window" },
  { provider:"google", model:"gemini-1.5-flash",  input_cost_per_mtok:0.075, output_cost_per_mtok:0.30,  context_window:1048576, release_date:"2024-05-24", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Best budget model" },
  { provider:"google", model:"gemini-2.0-flash-thinking", input_cost_per_mtok:0.10, output_cost_per_mtok:0.40, context_window:1048576, release_date:"2025-01-21", status:"ga", supports_vision:true, supports_functions:false, notes:"Gemini with thinking" },

  // ── Mistral (FULL LINEUP — April 2026) ───────────────────────────────
  { provider:"mistral", model:"mistral-large-3",      input_cost_per_mtok:0.50,  output_cost_per_mtok:1.50,  context_window:262144,  release_date:"2025-12-01", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Flagship — 60% cheaper than GPT-4o on output" },
  { provider:"mistral", model:"mistral-medium-3",     input_cost_per_mtok:0.40,  output_cost_per_mtok:2.00,  context_window:131072,  release_date:"2025-05-07", status:"ga",      supports_vision:false, supports_functions:true,  notes:"8x cheaper than GPT-4 class, enterprise-ready" },
  { provider:"mistral", model:"mistral-small-4",      input_cost_per_mtok:0.15,  output_cost_per_mtok:0.60,  context_window:262144,  release_date:"2026-03-16", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Unified: reasoning + vision + coding. Latest small." },
  { provider:"mistral", model:"mistral-small-3-2",    input_cost_per_mtok:0.075, output_cost_per_mtok:0.20,  context_window:128000,  release_date:"2025-03-17", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Cheapest Mistral — $0.075/1M" },
  { provider:"mistral", model:"codestral-2405",       input_cost_per_mtok:0.20,  output_cost_per_mtok:0.60,  context_window:32000,   release_date:"2024-05-29", status:"ga",      supports_vision:false, supports_functions:false, notes:"Specialized for code generation" },
  { provider:"mistral", model:"devstral-2",           input_cost_per_mtok:0.40,  output_cost_per_mtok:2.00,  context_window:131072,  release_date:"2025-12-10", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Advanced coding agent — beats Qwen 3 Coder" },
  { provider:"mistral", model:"magistral-medium",     input_cost_per_mtok:2.00,  output_cost_per_mtok:5.00,  context_window:131072,  release_date:"2025-06-10", status:"ga",      supports_vision:false, supports_functions:false, notes:"Mistral reasoning — rivals o3 at 37% cheaper output" },
  { provider:"mistral", model:"magistral-small",      input_cost_per_mtok:0.50,  output_cost_per_mtok:1.50,  context_window:131072,  release_date:"2025-06-10", status:"ga",      supports_vision:false, supports_functions:false, notes:"Compact chain-of-thought reasoning" },
  { provider:"mistral", model:"mistral-nemo",         input_cost_per_mtok:0.15,  output_cost_per_mtok:0.15,  context_window:128000,  release_date:"2024-07-18", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Small but very capable" },
  { provider:"mistral", model:"ministral-3b",         input_cost_per_mtok:0.04,  output_cost_per_mtok:0.04,  context_window:131072,  release_date:"2024-10-16", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Cheapest of all tracked — $0.04/1M" },
  { provider:"mistral", model:"ministral-8b",         input_cost_per_mtok:0.10,  output_cost_per_mtok:0.10,  context_window:131072,  release_date:"2024-10-16", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Edge/on-device deployment" },
  { provider:"mistral", model:"pixtral-large",        input_cost_per_mtok:2.00,  output_cost_per_mtok:6.00,  context_window:128000,  release_date:"2024-11-18", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Mistral flagship multimodal" },

  // ── xAI ─────────────────────────────────────────────────────────────
  { provider:"xai", model:"grok-3",              input_cost_per_mtok:3.00,  output_cost_per_mtok:15.00, context_window:131072,  release_date:"2025-02-17", status:"ga",      supports_vision:false, supports_functions:true,  notes:"xAI latest flagship" },
  { provider:"xai", model:"grok-3-mini",         input_cost_per_mtok:0.30,  output_cost_per_mtok:0.50,  context_window:131072,  release_date:"2025-02-17", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Affordable Grok 3" },
  { provider:"xai", model:"grok-2-1212",         input_cost_per_mtok:2.00,  output_cost_per_mtok:10.00, context_window:131072,  release_date:"2024-12-12", status:"ga",      supports_vision:false, supports_functions:true,  notes:"xAI previous flagship" },
  { provider:"xai", model:"grok-2-vision-1212",  input_cost_per_mtok:2.00,  output_cost_per_mtok:10.00, context_window:32768,   release_date:"2024-12-12", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Grok with vision" },

  // ── Meta ─────────────────────────────────────────────────────────────
  { provider:"meta", model:"llama-4-maverick",        input_cost_per_mtok:0.19,  output_cost_per_mtok:0.49,  context_window:1048576, release_date:"2025-04-05", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"Latest Meta flagship — 1M context" },
  { provider:"meta", model:"llama-4-scout",           input_cost_per_mtok:0.08,  output_cost_per_mtok:0.30,  context_window:10485760,release_date:"2025-04-05", status:"ga",      supports_vision:true,  supports_functions:true,  notes:"10M context — largest context available" },
  { provider:"meta", model:"llama-3.3-70b-instruct",  input_cost_per_mtok:0.23,  output_cost_per_mtok:0.40,  context_window:128000,  release_date:"2024-12-06", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Best open-source model" },
  { provider:"meta", model:"llama-3.1-405b-instruct", input_cost_per_mtok:0.90,  output_cost_per_mtok:0.90,  context_window:128000,  release_date:"2024-07-23", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Largest open-source model" },

  // ── DeepSeek ─────────────────────────────────────────────────────────
  { provider:"deepseek", model:"deepseek-chat",        input_cost_per_mtok:0.14,  output_cost_per_mtok:0.28,  context_window:64000,   release_date:"2024-05-06", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Extremely cheap and capable" },
  { provider:"deepseek", model:"deepseek-reasoner",    input_cost_per_mtok:0.55,  output_cost_per_mtok:2.19,  context_window:64000,   release_date:"2025-01-20", status:"ga",      supports_vision:false, supports_functions:false, notes:"DeepSeek R1 reasoning" },
  { provider:"deepseek", model:"deepseek-v3",          input_cost_per_mtok:0.27,  output_cost_per_mtok:1.10,  context_window:128000,  release_date:"2024-12-26", status:"ga",      supports_vision:false, supports_functions:true,  notes:"DeepSeek V3 — strong at coding" },

  // ── Cohere ───────────────────────────────────────────────────────────
  { provider:"cohere", model:"command-r-plus",  input_cost_per_mtok:2.50,  output_cost_per_mtok:10.00, context_window:128000,  release_date:"2024-04-04", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Cohere flagship RAG model" },
  { provider:"cohere", model:"command-r",       input_cost_per_mtok:0.15,  output_cost_per_mtok:0.60,  context_window:128000,  release_date:"2024-03-11", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Affordable Cohere model" },
  { provider:"cohere", model:"command-a",       input_cost_per_mtok:2.50,  output_cost_per_mtok:10.00, context_window:256000,  release_date:"2025-03-13", status:"ga",      supports_vision:false, supports_functions:true,  notes:"Cohere latest flagship" },
];

const PROVIDER_MAP = {
  "openai":"openai","anthropic":"anthropic","google":"google",
  "mistral":"mistral","mistralai":"mistral","meta-llama":"meta",
  "x-ai":"xai","deepseek":"deepseek","cohere":"cohere",
  "perplexity":"perplexity",
};

// ── Fetch live from OpenRouter ─────────────────────────────────────────
async function fetchLiveModels() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers:{"User-Agent":"OctopusAIIntel/2.1"},
      cf:{cacheTtl:3600},
    });
    if (!res.ok) return null;
    const data = await res.json();
    const models = [];
    for (const m of (data.data || [])) {
      if (!m.pricing?.prompt || !m.pricing?.completion) continue;
      const inputCost  = parseFloat(m.pricing.prompt)     * 1_000_000;
      const outputCost = parseFloat(m.pricing.completion) * 1_000_000;
      if (inputCost === 0 && outputCost === 0) continue;
      if (inputCost > 200) continue;
      const parts    = (m.id || "").split("/");
      const provSlug = parts[0] || "unknown";
      const provider = PROVIDER_MAP[provSlug] || provSlug;
      const major    = ["openai","anthropic","google","mistral","meta","xai","deepseek","cohere"];
      if (!major.includes(provider)) continue;
      models.push({
        provider,
        model:                m.name || parts.slice(1).join("/"),
        model_id:             m.id,
        input_cost_per_mtok:  Math.round(inputCost  * 10000) / 10000,
        output_cost_per_mtok: Math.round(outputCost * 10000) / 10000,
        context_window:       m.context_length || 4096,
        status:               "ga",
        supports_vision:      !!(m.architecture?.modality?.includes("image")),
        supports_functions:   true,
        notes:                (m.description||"").slice(0,100),
        source:               "openrouter",
      });
    }
    // Merge: prefer OpenRouter live data but fill gaps with seed
    const liveIds = new Set(models.map(m => m.model.toLowerCase()));
    for (const s of SEED_MODELS) {
      if (!liveIds.has(s.model.toLowerCase())) {
        models.push({...s, source:"seed"});
      }
    }
    return models.length > 5 ? models : null;
  } catch { return null; }
}

async function getModels(env) {
  if (env?.OCTOPUS_KV) {
    try {
      const cached = await env.OCTOPUS_KV.get("models:latest");
      if (cached) return JSON.parse(cached);
    } catch {}
  }
  const live = await fetchLiveModels();
  if (live) {
    if (env?.OCTOPUS_KV) {
      try { await env.OCTOPUS_KV.put("models:latest", JSON.stringify(live), {expirationTtl:21600}); } catch {}
    }
    return live;
  }
  return SEED_MODELS.map(m => ({...m, source:"seed"}));
}

// ── Refresh cycle ──────────────────────────────────────────────────────
async function refreshCycle(env) {
  if (!env?.OCTOPUS_KV) return;
  try {
    const current = await env.OCTOPUS_KV.get("models:latest");
    if (current) await env.OCTOPUS_KV.put("models:prev", current, {expirationTtl:86400*2});
    const live = await fetchLiveModels();
    if (!live) return;
    await env.OCTOPUS_KV.put("models:latest", JSON.stringify(live), {expirationTtl:21600});
    await env.OCTOPUS_KV.put("models:updated", Date.now().toString());
    for (const m of live) {
      const key = `history:${m.model}`;
      let hist = [];
      try { const raw = await env.OCTOPUS_KV.get(key); if (raw) hist = JSON.parse(raw); } catch {}
      hist.push({ts:Date.now(), input:m.input_cost_per_mtok, output:m.output_cost_per_mtok});
      if (hist.length > 336) hist = hist.slice(-336);
      await env.OCTOPUS_KV.put(key, JSON.stringify(hist), {expirationTtl:86400*8});
    }
    if (current) {
      const prev = JSON.parse(current);
      const events = detectChanges(prev, live);
      if (events.length > 0) {
        let cl = [];
        try { const raw = await env.OCTOPUS_KV.get("changelog"); if (raw) cl = JSON.parse(raw); } catch {}
        cl = [...events, ...cl].slice(0,100);
        await env.OCTOPUS_KV.put("changelog", JSON.stringify(cl), {expirationTtl:86400*30});
      }
    }
  } catch(e) { console.error("Refresh error:", e); }
}

function detectChanges(prev, next) {
  const events = [];
  const prevMap = {};
  for (const m of prev) prevMap[m.model] = m;
  const nextRanked = [...next].sort((a,b)=>a.input_cost_per_mtok-b.input_cost_per_mtok);
  const prevRanked = [...prev].sort((a,b)=>a.input_cost_per_mtok-b.input_cost_per_mtok);
  for (const m of next) {
    const p = prevMap[m.model];
    if (!p) { events.push({ts:Date.now(),type:"new_model",model:m.model,provider:m.provider,msg:`🆕 New: ${m.model} at $${m.input_cost_per_mtok}/1M`,input_cost:m.input_cost_per_mtok}); continue; }
    const prevIn = p.input_cost_per_mtok||0;
    const newIn  = m.input_cost_per_mtok||0;
    if (prevIn===0) continue;
    const deltaPct = ((newIn-prevIn)/prevIn)*100;
    if (Math.abs(deltaPct)>=3) {
      const dir = deltaPct<0?"down":"up";
      const emoji = deltaPct<0?"📉":"📈";
      const newRank  = nextRanked.findIndex(x=>x.model===m.model)+1;
      const prevRank = prevRanked.findIndex(x=>x.model===p.model)+1;
      events.push({ts:Date.now(),type:"price_change",direction:dir,model:m.model,provider:m.provider,delta_pct:Math.round(deltaPct*10)/10,prev_cost:prevIn,new_cost:newIn,rank_before:prevRank,rank_after:newRank,rank_change:prevRank-newRank,msg:`${emoji} ${m.model} ${dir} ${Math.abs(deltaPct).toFixed(0)}% ($${prevIn}→$${newIn}/1M)`});
    }
  }
  return events;
}

function computeDelta(history, currentCost) {
  if (!history||history.length<2) return null;
  const now=Date.now();
  const findAt=(msAgo)=>{ const t=now-msAgo; let b=history[0]; for(const h of history){if(Math.abs(h.ts-t)<Math.abs(b.ts-t))b=h;} return b; };
  const h24=findAt(86400000); const h7d=findAt(86400000*7);
  const d24=h24?((currentCost-h24.input)/h24.input)*100:null;
  const d7 =h7d?((currentCost-h7d.input)/h7d.input)*100:null;
  return {delta_24h_pct:d24!==null?Math.round(d24*10)/10:null,delta_7d_pct:d7!==null?Math.round(d7*10)/10:null,cost_24h_ago:h24?.input||null,cost_7d_ago:h7d?.input||null,signal:getSignal(d7,d24,currentCost)};
}

function getSignal(d7,d24,cost) {
  if(d24!==null&&d24<=-15) return `🔥 Dropped ${Math.abs(d24).toFixed(0)}% in 24h — act now`;
  if(d24!==null&&d24>=15)  return `⚠️ Jumped ${d24.toFixed(0)}% in 24h — consider switching`;
  if(d7!==null&&d7<=-20)   return `📉 Down ${Math.abs(d7).toFixed(0)}% this week — great time to use`;
  if(d7!==null&&d7>=20)    return `📈 Up ${d7.toFixed(0)}% this week — check alternatives`;
  if(d7!==null&&d7<=-5)    return `📉 Gradually getting cheaper this week`;
  if(d7!==null&&d7>=5)     return `📈 Gradually getting pricier this week`;
  if(cost<=0.1)             return `💰 Ultra-budget tier — ideal for massive scale`;
  if(cost<=0.5)             return `💰 Budget tier — great value`;
  if(cost>=10)              return `💎 Premium tier — use for complex tasks only`;
  return `➡️ Price stable`;
}

function valueScore(m) {
  const c=1/((m.input_cost_per_mtok||0.01)+0.01);
  const x=Math.log10((m.context_window||4096)/1000+1);
  return Math.round((c*0.6+x*0.4)*1000)/1000;
}

// ── Smart recommend ────────────────────────────────────────────────────
function smartRecommend(useCase, models) {
  const u=useCase.toLowerCase();
  let pool=[...models];
  const reasons=[];
  const budgetMatch=u.match(/\$(\d+(?:\.\d+)?)\s*(?:\/month|per month|monthly|budget)/i);
  const volumeMatch=u.match(/(\d+(?:,\d+)?)\s*(?:x|times|calls|requests)/i);
  let budget=budgetMatch?parseFloat(budgetMatch[1]):null;
  let volume=volumeMatch?parseInt(volumeMatch[1].replace(/,/g,'')):null;
  const isCode   =/cod|programm|develop|script|function|debug/.test(u);
  const isVision =/image|vision|photo|screenshot|visual|picture/.test(u);
  const isLong   =/long|document|pdf|book|50k|100k|200k|context/.test(u);
  const isFast   =/fast|quick|realtime|real-time|low.latenc|speed/.test(u);
  const isCheap  =/cheap|budget|affordable|low.cost|save|cost/.test(u);
  const isQuality=/best|quality|accurate|smart|intelligent|complex/.test(u);
  if(isVision){pool=pool.filter(m=>m.supports_vision);reasons.push("vision-capable");}
  if(isCode){pool=pool.filter(m=>m.supports_functions);reasons.push("supports function calling");}
  if(isLong){pool=pool.filter(m=>(m.context_window||0)>=100000);reasons.push("large context");}
  if(isFast){pool=pool.filter(m=>/flash|mini|haiku|small|nano|nemo|3b/.test((m.model||'').toLowerCase()));reasons.push("fast tier");}
  if(budget&&volume){const max=(budget/volume/1000)*1_000_000;pool=pool.filter(m=>(m.input_cost_per_mtok||0)<=max);reasons.push(`fits $${budget}/month at ${volume} requests`);}
  pool=pool.map(m=>({...m,value_score:valueScore(m)}));
  if(isCheap||(budget&&!isQuality)) pool.sort((a,b)=>(a.input_cost_per_mtok||0)-(b.input_cost_per_mtok||0));
  else pool.sort((a,b)=>b.value_score-a.value_score);
  const top=pool.slice(0,3);
  let costEstimate=null;
  if(volume&&top[0]){const totalMtok=(volume*2000)/1_000_000;costEstimate=`~$${(totalMtok*(top[0].input_cost_per_mtok||0)).toFixed(2)}/month at ${volume} requests (2K tokens avg)`;}
  return {recommendations:top,reasoning:reasons.length?`Filtered for: ${reasons.join(", ")}`:"Ranked by best value",cost_estimate:costEstimate,detected:{vision:isVision,code:isCode,long_context:isLong,speed:isFast,budget_conscious:isCheap,quality_focus:isQuality,budget_constraint:budget?`$${budget}/month`:null,volume:volume?`${volume}/month`:null}};
}

// ── CORS & helpers ─────────────────────────────────────────────────────
const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, X-RapidAPI-Key, X-RapidAPI-Proxy-Secret","Content-Type":"application/json"};
const json=(d,s=200)=>new Response(JSON.stringify(d,null,2),{status:s,headers:CORS});
const error=(msg,s=400)=>json({error:msg},s);
function isRapidAPIRequest(req,env){const secret=req.headers.get("X-RapidAPI-Proxy-Secret");if(!secret)return false;if(env?.RAPIDAPI_SECRET)return secret===env.RAPIDAPI_SECRET;return true;}

// ── Today's winners (for Twitter / website hero) ───────────────────────
function getTodayWinners(models) {
  const today = new Date().toISOString().split('T')[0];
  const sorted = [...models].sort((a,b)=>a.input_cost_per_mtok-b.input_cost_per_mtok);
  const cheapest = sorted[0];
  const expensive = [...sorted].reverse()[0];
  const bestValue = [...models].sort((a,b)=>valueScore(b)-valueScore(a))[0];
  const fastestCtx = [...models].sort((a,b)=>b.context_window-a.context_window)[0];
  return {
    date: today,
    cheapest: {model:cheapest?.model, provider:cheapest?.provider, input_cost:cheapest?.input_cost_per_mtok, signal:`💰 Today's cheapest: ${cheapest?.model} (${cheapest?.provider}) at $${cheapest?.input_cost_per_mtok}/1M tokens`},
    most_expensive: {model:expensive?.model, provider:expensive?.provider, input_cost:expensive?.input_cost_per_mtok, signal:`💎 Most premium: ${expensive?.model} (${expensive?.provider}) at $${expensive?.input_cost_per_mtok}/1M tokens`},
    best_value: {model:bestValue?.model, provider:bestValue?.provider, score:valueScore(bestValue), signal:`⭐ Best value: ${bestValue?.model} (${bestValue?.provider}) — top quality/price ratio`},
    largest_context: {model:fastestCtx?.model, provider:fastestCtx?.provider, context_window:fastestCtx?.context_window, signal:`📄 Largest context: ${fastestCtx?.model} — ${fastestCtx?.context_window>=1e6?(fastestCtx.context_window/1e6).toFixed(1)+'M':Math.round(fastestCtx?.context_window/1000)+'K'} tokens`},
    twitter_post: `🐙 AI Model Intel — ${today}\n\n💰 Cheapest: ${cheapest?.model} $${cheapest?.input_cost_per_mtok}/1M\n💎 Premium: ${expensive?.model} $${expensive?.input_cost_per_mtok}/1M\n⭐ Best value: ${bestValue?.model}\n📄 Largest context: ${fastestCtx?.model}\n\nFull rankings → ai-model-intel.vercel.app\n\n#AI #AIModels #LLM #BuildInPublic`,
  };
}

// ── Main handler ───────────────────────────────────────────────────────
async function handleRequest(request, env) {
  if(request.method==="OPTIONS") return new Response(null,{headers:CORS});
  const url=new URL(request.url);
  const path=url.pathname.replace(/\/$/,"")||"/";
  const isPaid=isRapidAPIRequest(request,env);

  // /health
  if(path==="/"||path==="/health"){
    const models=await getModels(env);
    const updated=env?.OCTOPUS_KV?await env.OCTOPUS_KV.get("models:updated"):null;
    return json({status:"operational",version:"2.1",api:"Octopus AI Model Intel — Decision Intelligence Platform",models_count:models.length,providers:[...new Set(models.map(m=>m.provider))],data_source:models[0]?.source||"seed",last_updated:updated?new Date(parseInt(updated)).toISOString():new Date().toISOString(),access:isPaid?"full":"free_tier",endpoints:{free:["/models","/pricing","/health","/deltas","/alerts","/changelog","/today","/winners"],premium:["/models/{provider}","/compare","/cheapest","/trends/{model}","/recommend","/providers","/search"],subscribe:"https://rapidapi.com/zakmediaai/api/octopus-ai-model-intel"}});
  }

  // /today — NEW: today's winners with Twitter-ready post
  if(path==="/today"||path==="/winners"){
    const models=await getModels(env);
    return json(getTodayWinners(models));
  }

  // /models (public)
  if(path==="/models"){
    let models=await getModels(env);
    models=[...models].sort((a,b)=>a.input_cost_per_mtok-b.input_cost_per_mtok);
    if(isPaid){
      const p=url.searchParams.get("provider");
      const v=url.searchParams.get("vision");
      const s=url.searchParams.get("status");
      if(p)models=models.filter(m=>m.provider===p.toLowerCase());
      if(v==="true")models=models.filter(m=>m.supports_vision);
      if(s)models=models.filter(m=>m.status===s);
    }
    return json({count:models.length,models:models.map((m,i)=>({...m,rank:i+1,value_score:valueScore(m),signal:getSignal(null,null,m.input_cost_per_mtok||0)}))});
  }

  // /pricing (public)
  if(path==="/pricing"){
    const models=await getModels(env);
    const sorted=[...models].sort((a,b)=>a.input_cost_per_mtok-b.input_cost_per_mtok);
    return json({count:sorted.length,pricing:sorted.map((m,i)=>({rank:i+1,provider:m.provider,model:m.model,input_cost_per_mtok:m.input_cost_per_mtok,output_cost_per_mtok:m.output_cost_per_mtok,cost_per_1k_in:Math.round(m.input_cost_per_mtok/1000*100000)/100000,cost_per_1k_out:Math.round(m.output_cost_per_mtok/1000*100000)/100000,context_window:m.context_window,value_score:valueScore(m),signal:getSignal(null,null,m.input_cost_per_mtok||0)}))});
  }

  // /deltas (public)
  if(path==="/deltas"){
    const models=await getModels(env);
    const period=url.searchParams.get("period")||"7d";
    const minPct=parseFloat(url.searchParams.get("min_pct")||"0");
    const results=[];
    for(const m of models){
      let hist=null;
      if(env?.OCTOPUS_KV){try{const raw=await env.OCTOPUS_KV.get(`history:${m.model}`);if(raw)hist=JSON.parse(raw);}catch{}}
      const delta=computeDelta(hist,m.input_cost_per_mtok||0);
      if(delta){const pct=period==="24h"?delta.delta_24h_pct:delta.delta_7d_pct;if(pct===null)continue;if(Math.abs(pct)<minPct)continue;results.push({model:m.model,provider:m.provider,current_cost:m.input_cost_per_mtok,delta_24h_pct:delta.delta_24h_pct,delta_7d_pct:delta.delta_7d_pct,cost_24h_ago:delta.cost_24h_ago,cost_7d_ago:delta.cost_7d_ago,direction:(pct||0)<0?"down":(pct||0)>0?"up":"stable",signal:delta.signal});}
      else results.push({model:m.model,provider:m.provider,current_cost:m.input_cost_per_mtok,delta_24h_pct:null,delta_7d_pct:null,direction:"stable",signal:getSignal(null,null,m.input_cost_per_mtok||0),note:"Building history — check back in 24h"});
    }
    const withData=results.filter(r=>r.delta_7d_pct!==null).sort((a,b)=>Math.abs(b.delta_7d_pct||0)-Math.abs(a.delta_7d_pct||0));
    const withoutData=results.filter(r=>r.delta_7d_pct===null);
    return json({period,count:results.length,biggest_movers:withData.slice(0,5).map(r=>r.signal),deltas:[...withData,...withoutData]});
  }

  // /alerts (public)
  if(path==="/alerts"){
    const models=await getModels(env);
    const alerts=[];
    for(const m of models){
      let hist=null;
      if(env?.OCTOPUS_KV){try{const raw=await env.OCTOPUS_KV.get(`history:${m.model}`);if(raw)hist=JSON.parse(raw);}catch{}}
      const delta=computeDelta(hist,m.input_cost_per_mtok||0);
      if(!delta)continue;
      const d24=delta.delta_24h_pct;const d7=delta.delta_7d_pct;
      if((d24!==null&&Math.abs(d24)>=10)||(d7!==null&&Math.abs(d7)>=15)){
        alerts.push({model:m.model,provider:m.provider,current_cost:m.input_cost_per_mtok,delta_24h_pct:d24,delta_7d_pct:d7,severity:Math.abs(d24||d7||0)>=25?"high":"medium",signal:delta.signal,action:(d24||0)<-10?"Consider switching to this model — price dropped significantly":(d24||0)>10?"Consider switching away — price increased":"Monitor for further changes"});
      }
    }
    alerts.sort((a,b)=>Math.abs(b.delta_24h_pct||0)-Math.abs(a.delta_24h_pct||0));
    return json({count:alerts.length,note:alerts.length===0?"No significant price movements yet. Building baseline — check back in 24h.":undefined,alerts});
  }

  // /changelog (public)
  if(path==="/changelog"){
    let changelog=[];
    if(env?.OCTOPUS_KV){try{const raw=await env.OCTOPUS_KV.get("changelog");if(raw)changelog=JSON.parse(raw);}catch{}}
    if(!changelog.length)changelog=[{ts:Date.now(),type:"system",msg:"📡 Changelog tracking started — events appear when prices change >3%"}];
    const limit=parseInt(url.searchParams.get("limit")||"50");
    return json({count:changelog.length,changelog:changelog.slice(0,limit).map(e=>({...e,date:new Date(e.ts).toISOString()}))});
  }

  // PREMIUM GATE
  if(!isPaid){return json({error:"Premium endpoint. Subscribe on RapidAPI.",subscribe:"https://rapidapi.com/zakmediaai/api/octopus-ai-model-intel",free_endpoints:["/models","/pricing","/deltas","/alerts","/changelog","/health","/today","/winners"]},403);}

  // /models/:provider
  const pm=path.match(/^\/models\/([a-zA-Z0-9_-]+)$/);
  if(pm){const models=await getModels(env);const p=pm[1].toLowerCase();const r=models.filter(m=>m.provider===p).sort((a,b)=>a.input_cost_per_mtok-b.input_cost_per_mtok);if(!r.length)return error(`No models for: ${p}`,404);return json({provider:p,count:r.length,models:r.map(m=>({...m,value_score:valueScore(m)}))});}

  // /compare
  if(path==="/compare"){
    const param=url.searchParams.get("models");
    if(!param)return error("Missing ?models= e.g. /compare?models=gpt-4o,mistral-large-3");
    const models=await getModels(env);
    const names=param.split(",").map(s=>s.trim().toLowerCase());
    const found=names.map(n=>models.find(m=>(m.model||"").toLowerCase()===n||(m.model||"").toLowerCase().includes(n)));
    const miss=names.filter((_,i)=>!found[i]);
    if(miss.length)return error(`Not found: ${miss.join(", ")}. Try /search?q=name`);
    const comp=found.map(m=>({...m,value_score:valueScore(m),signal:getSignal(null,null,m.input_cost_per_mtok||0)}));
    const sorted=[...comp].sort((a,b)=>a.input_cost_per_mtok-b.input_cost_per_mtok);
    return json({models:comp,winners:{cheapest_input:sorted[0].model,most_expensive:sorted[sorted.length-1].model,largest_context:[...comp].sort((a,b)=>b.context_window-a.context_window)[0].model,best_value:[...comp].sort((a,b)=>b.value_score-a.value_score)[0].model},savings:{vs_cheapest:comp.map(m=>({model:m.model,savings_pct:Math.round(((m.input_cost_per_mtok-sorted[0].input_cost_per_mtok)/(m.input_cost_per_mtok||1))*100)}))}});
  }

  // /cheapest
  if(path==="/cheapest"){
    const task=(url.searchParams.get("task")||"chat").toLowerCase();
    const models=await getModels(env);
    let pool=[...models],rationale="";
    if(task==="vision"){pool=pool.filter(m=>m.supports_vision);rationale="Vision-capable";}
    else if(task==="code"){pool=pool.filter(m=>m.supports_functions&&["openai","anthropic","mistral","google"].includes(m.provider));rationale="Top code-capable";}
    else if(task==="long-context"){pool=pool.filter(m=>(m.context_window||0)>=200000);rationale="Largest context";}
    else if(task==="fast"){pool=pool.filter(m=>/flash|mini|haiku|small|nano|nemo|3b/.test((m.model||"").toLowerCase()));rationale="Fast lightweight";}
    else if(task==="reasoning"){pool=pool.filter(m=>/magistral|reasoner|o1|o3|thinking/.test((m.model||"").toLowerCase()));rationale="Reasoning models";}
    else rationale="All models by best value";
    pool.sort((a,b)=>a.input_cost_per_mtok-b.input_cost_per_mtok);
    return json({task,rationale,recommendations:pool.slice(0,5).map((m,i)=>({rank:i+1,...m,value_score:valueScore(m),signal:getSignal(null,null,m.input_cost_per_mtok||0)}))});
  }

  // /trends/:model
  const tm=path.match(/^\/trends\/(.+)$/);
  if(tm){
    const modelName=decodeURIComponent(tm[1]);
    let hist=[];
    if(env?.OCTOPUS_KV){try{const raw=await env.OCTOPUS_KV.get(`history:${modelName}`);if(raw)hist=JSON.parse(raw);}catch{}}
    if(!hist.length)return json({model:modelName,note:"No history yet. Snapshots taken every 30 minutes.",datapoints:[]});
    const days=parseInt(url.searchParams.get("days")||"7");
    const since=Date.now()-(days*86400000);
    const filtered=hist.filter(h=>h.ts>=since);
    const minCost=Math.min(...filtered.map(h=>h.input));
    const maxCost=Math.max(...filtered.map(h=>h.input));
    const latest=filtered[filtered.length-1]?.input||0;
    const oldest=filtered[0]?.input||0;
    const changePct=oldest?((latest-oldest)/oldest)*100:0;
    return json({model:modelName,days,datapoints:filtered.map(h=>({date:new Date(h.ts).toISOString(),input_cost:h.input,output_cost:h.output})),summary:{min_cost:minCost,max_cost:maxCost,current:latest,change_pct:Math.round(changePct*10)/10,trend:changePct<-5?"decreasing":changePct>5?"increasing":"stable"}});
  }

  // /recommend
  if(path==="/recommend"){
    let useCase=url.searchParams.get("q")||url.searchParams.get("use_case")||"";
    if(request.method==="POST"){try{const body=await request.json();useCase=body.use_case||body.q||useCase;}catch{}}
    if(!useCase.trim())return error("Missing ?q= e.g. /recommend?q=cheap+model+for+code+1000+calls+per+day+$20+budget");
    const models=await getModels(env);
    const result=smartRecommend(useCase,models);
    return json({use_case:useCase,...result,recommendations:result.recommendations.map(m=>({...m,value_score:valueScore(m),signal:getSignal(null,null,m.input_cost_per_mtok||0)}))});
  }

  // /providers
  if(path==="/providers"){
    const models=await getModels(env);
    const provs=[...new Set(models.map(m=>m.provider))].map(p=>{const pm=models.filter(m=>m.provider===p);const costs=pm.map(m=>m.input_cost_per_mtok||0);return{provider:p,status:"operational",model_count:pm.length,cheapest_input:Math.min(...costs),most_expensive:Math.max(...costs),avg_input:Math.round((costs.reduce((s,c)=>s+c,0)/costs.length)*1000)/1000,max_context:Math.max(...pm.map(m=>m.context_window||0)),has_vision:pm.some(m=>m.supports_vision),models:pm.map(m=>m.model),last_checked:new Date().toISOString()};});
    return json({count:provs.length,providers:provs});
  }

  // /search
  if(path==="/search"){
    const q=(url.searchParams.get("q")||"").toLowerCase().trim();
    if(!q)return error("Missing ?q=");
    const models=await getModels(env);
    const r=models.filter(m=>(m.model||"").toLowerCase().includes(q)||(m.provider||"").toLowerCase().includes(q)||(m.notes||"").toLowerCase().includes(q));
    return json({query:q,count:r.length,models:r.map(m=>({...m,value_score:valueScore(m)}))});
  }

  return error("Not found. Call /health for endpoints.",404);
}

export default {
  async fetch(request,env,ctx){
    if(Math.random()<0.05&&env?.OCTOPUS_KV) ctx.waitUntil(refreshCycle(env));
    return handleRequest(request,env);
  },
  async scheduled(event,env,ctx){ ctx.waitUntil(refreshCycle(env)); },
};
