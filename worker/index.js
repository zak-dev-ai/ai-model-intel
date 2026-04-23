/**
 * 🐙 OCTOPUS AI MODEL INTEL
 * Cloudflare Worker — RapidAPI ready
 * 
 * Auto-fetches live pricing from OpenRouter public API (free, no key needed)
 * Falls back to hardcoded seed data if fetch fails
 * Caches data for 6 hours in Cloudflare KV (or memory if no KV)
 */

// ── Seed/fallback data — used if OpenRouter fetch fails ──────────────
const SEED_MODELS = [
  { provider:"openai",    model:"gpt-4o",                      model_family:"GPT-4o",     input_cost_per_mtok:2.50,  output_cost_per_mtok:10.00, context_window:128000,  release_date:"2024-05-13", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:4096,   notes:"Flagship multimodal model" },
  { provider:"openai",    model:"gpt-4o-mini",                 model_family:"GPT-4o",     input_cost_per_mtok:0.15,  output_cost_per_mtok:0.60,  context_window:128000,  release_date:"2024-07-18", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:16384,  notes:"Fast and affordable" },
  { provider:"openai",    model:"gpt-4-turbo",                 model_family:"GPT-4",      input_cost_per_mtok:10.00, output_cost_per_mtok:30.00, context_window:128000,  release_date:"2024-04-09", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:4096,   notes:"Predecessor to GPT-4o" },
  { provider:"openai",    model:"o1",                          model_family:"o1",         input_cost_per_mtok:15.00, output_cost_per_mtok:60.00, context_window:200000,  release_date:"2024-12-17", status:"ga",      supports_vision:true,  supports_functions:false, max_output_tokens:100000, notes:"Advanced reasoning" },
  { provider:"openai",    model:"o3-mini",                     model_family:"o3",         input_cost_per_mtok:1.10,  output_cost_per_mtok:4.40,  context_window:200000,  release_date:"2025-01-31", status:"ga",      supports_vision:false, supports_functions:true,  max_output_tokens:100000, notes:"Cost-efficient reasoning" },
  { provider:"anthropic", model:"claude-3-5-sonnet-20241022",  model_family:"Claude 3.5", input_cost_per_mtok:3.00,  output_cost_per_mtok:15.00, context_window:200000,  release_date:"2024-10-22", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:8192,   notes:"Best overall Anthropic model" },
  { provider:"anthropic", model:"claude-3-5-haiku-20241022",   model_family:"Claude 3.5", input_cost_per_mtok:0.80,  output_cost_per_mtok:4.00,  context_window:200000,  release_date:"2024-11-05", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:8192,   notes:"Fastest Anthropic model" },
  { provider:"anthropic", model:"claude-3-opus-20240229",      model_family:"Claude 3",   input_cost_per_mtok:15.00, output_cost_per_mtok:75.00, context_window:200000,  release_date:"2024-02-29", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:4096,   notes:"Most powerful Claude 3" },
  { provider:"anthropic", model:"claude-3-haiku-20240307",     model_family:"Claude 3",   input_cost_per_mtok:0.25,  output_cost_per_mtok:1.25,  context_window:200000,  release_date:"2024-03-07", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:4096,   notes:"Fastest Claude 3" },
  { provider:"google",    model:"gemini-2.5-pro",              model_family:"Gemini 2.5", input_cost_per_mtok:1.25,  output_cost_per_mtok:5.00,  context_window:1048576, release_date:"2025-03-25", status:"preview", supports_vision:true,  supports_functions:true,  max_output_tokens:65536,  notes:"1M context thinking model" },
  { provider:"google",    model:"gemini-2.5-flash",            model_family:"Gemini 2.5", input_cost_per_mtok:0.15,  output_cost_per_mtok:0.60,  context_window:1048576, release_date:"2025-05-01", status:"preview", supports_vision:true,  supports_functions:true,  max_output_tokens:65536,  notes:"Fast Gemini 2.5 variant" },
  { provider:"google",    model:"gemini-2.0-flash",            model_family:"Gemini 2.0", input_cost_per_mtok:0.10,  output_cost_per_mtok:0.40,  context_window:1048576, release_date:"2025-02-05", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:8192,   notes:"Fast and cheap 1M context" },
  { provider:"google",    model:"gemini-1.5-pro",              model_family:"Gemini 1.5", input_cost_per_mtok:1.25,  output_cost_per_mtok:5.00,  context_window:2097152, release_date:"2024-05-24", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:8192,   notes:"2M token context window" },
  { provider:"google",    model:"gemini-1.5-flash",            model_family:"Gemini 1.5", input_cost_per_mtok:0.075, output_cost_per_mtok:0.30,  context_window:1048576, release_date:"2024-05-24", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:8192,   notes:"Best budget model" },
  { provider:"mistral",   model:"mistral-large-2411",          model_family:"Mistral Large", input_cost_per_mtok:2.00, output_cost_per_mtok:6.00, context_window:128000, release_date:"2024-11-18", status:"ga",      supports_vision:false, supports_functions:true,  max_output_tokens:4096,   notes:"Flagship Mistral" },
  { provider:"mistral",   model:"mistral-small-2409",          model_family:"Mistral Small", input_cost_per_mtok:0.20, output_cost_per_mtok:0.60, context_window:32000,  release_date:"2024-09-18", status:"ga",      supports_vision:false, supports_functions:true,  max_output_tokens:4096,   notes:"Efficient and affordable" },
  { provider:"mistral",   model:"codestral-2405",              model_family:"Codestral",  input_cost_per_mtok:0.20,  output_cost_per_mtok:0.60,  context_window:32000,  release_date:"2024-05-29", status:"ga",      supports_vision:false, supports_functions:false, max_output_tokens:4096,   notes:"Specialized for code" },
  { provider:"xai",       model:"grok-2-1212",                 model_family:"Grok 2",     input_cost_per_mtok:2.00,  output_cost_per_mtok:10.00, context_window:131072, release_date:"2024-12-12", status:"ga",      supports_vision:false, supports_functions:true,  max_output_tokens:131072, notes:"xAI flagship" },
  { provider:"xai",       model:"grok-2-vision-1212",          model_family:"Grok 2",     input_cost_per_mtok:2.00,  output_cost_per_mtok:10.00, context_window:32768,  release_date:"2024-12-12", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:32768,  notes:"Grok with vision" },
  { provider:"meta",      model:"llama-3.3-70b-instruct",      model_family:"Llama 3.3",  input_cost_per_mtok:0.23,  output_cost_per_mtok:0.40,  context_window:128000, release_date:"2024-12-06", status:"ga",      supports_vision:false, supports_functions:true,  max_output_tokens:8192,   notes:"Best open-source model" },
  { provider:"meta",      model:"llama-3.1-405b-instruct",     model_family:"Llama 3.1",  input_cost_per_mtok:0.90,  output_cost_per_mtok:0.90,  context_window:128000, release_date:"2024-07-23", status:"ga",      supports_vision:false, supports_functions:true,  max_output_tokens:4096,   notes:"Largest open-source model" },
];

// ── Provider mapping from OpenRouter slugs ────────────────────────────
const PROVIDER_MAP = {
  "openai":    "openai",
  "anthropic": "anthropic",
  "google":    "google",
  "mistral":   "mistral",
  "meta-llama":"meta",
  "x-ai":      "xai",
  "deepseek":  "deepseek",
  "cohere":    "cohere",
  "perplexity":"perplexity",
};

// ── Fetch live data from OpenRouter (free public API) ─────────────────
async function fetchLiveModels() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { "User-Agent": "OctopusAIIntel/1.0" },
      cf: { cacheTtl: 21600 }, // cache 6 hours at Cloudflare edge
    });
    if (!res.ok) return null;

    const data = await res.json();
    const models = [];

    for (const m of (data.data || [])) {
      // Only include models with pricing data
      if (!m.pricing?.prompt || !m.pricing?.completion) continue;

      const inputCost  = parseFloat(m.pricing.prompt)     * 1_000_000;
      const outputCost = parseFloat(m.pricing.completion) * 1_000_000;

      // Skip free models (price = 0) and extremely expensive ones
      if (inputCost === 0 && outputCost === 0) continue;
      if (inputCost > 200) continue;

      // Extract provider from model ID (format: "provider/model-name")
      const parts      = (m.id || "").split("/");
      const provSlug   = parts[0] || "unknown";
      const modelSlug  = parts.slice(1).join("/") || m.id;
      const provider   = PROVIDER_MAP[provSlug] || provSlug;

      // Only include major providers
      const majorProviders = ["openai","anthropic","google","mistral","meta","xai","deepseek","cohere"];
      if (!majorProviders.includes(provider)) continue;

      models.push({
        provider,
        model:                m.name || modelSlug,
        model_id:             m.id,
        model_family:         (m.name || "").split(" ").slice(0,2).join(" "),
        input_cost_per_mtok:  Math.round(inputCost  * 10000) / 10000,
        output_cost_per_mtok: Math.round(outputCost * 10000) / 10000,
        context_window:       m.context_length || 4096,
        status:               "ga",
        supports_vision:      !!(m.architecture?.modality?.includes("image")),
        supports_functions:   true,
        max_output_tokens:    m.top_provider?.max_completion_tokens || 4096,
        notes:                m.description?.slice(0, 100) || "",
        source:               "openrouter",
        last_updated:         new Date().toISOString(),
      });
    }

    return models.length > 5 ? models : null;
  } catch (e) {
    return null;
  }
}

// ── Get models — live first, fallback to seed ─────────────────────────
async function getModels(env) {
  // Try KV cache first (if KV is bound)
  if (env?.MODEL_CACHE) {
    try {
      const cached = await env.MODEL_CACHE.get("models");
      if (cached) return JSON.parse(cached);
    } catch {}
  }

  // Fetch live from OpenRouter
  const live = await fetchLiveModels();
  if (live && live.length > 0) {
    // Store in KV cache for 6 hours if available
    if (env?.MODEL_CACHE) {
      try {
        await env.MODEL_CACHE.put("models", JSON.stringify(live), { expirationTtl: 21600 });
      } catch {}
    }
    return live;
  }

  // Fallback to seed data
  return SEED_MODELS.map(m => ({ ...m, source: "seed", last_updated: new Date().toISOString() }));
}

// ── CORS & helpers ────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-RapidAPI-Key, X-RapidAPI-Proxy-Secret",
  "Content-Type": "application/json",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: CORS });
}

function valueScore(m) {
  const c = 1 / (m.input_cost_per_mtok + 0.01);
  const x = Math.log10((m.context_window || 4096) / 1000 + 1);
  return Math.round((c * 0.6 + x * 0.4) * 1000) / 1000;
}

function isRapidAPIRequest(request, env) {
  const secret = request.headers.get("X-RapidAPI-Proxy-Secret");
  if (!secret) return false;
  if (env?.RAPIDAPI_SECRET) return secret === env.RAPIDAPI_SECRET;
  return true;
}

// ── Main handler ──────────────────────────────────────────────────────
async function handleRequest(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url    = new URL(request.url);
  const path   = url.pathname.replace(/\/$/, "") || "/";
  const isPaid = isRapidAPIRequest(request, env);

  // PUBLIC: /health
  if (path === "/" || path === "/health") {
    const models = await getModels(env);
    return json({
      status:       "operational",
      api:          "Octopus AI Model Intel",
      models_count: models.length,
      providers:    [...new Set(models.map(m => m.provider))],
      data_source:  models[0]?.source || "seed",
      last_updated: models[0]?.last_updated || new Date().toISOString(),
      access:       isPaid ? "full" : "teaser",
      endpoints: {
        public:    ["GET /models", "GET /pricing", "GET /health"],
        premium:   ["GET /models/{provider}", "GET /compare", "GET /cheapest", "GET /providers", "GET /search"],
        subscribe: "https://rapidapi.com/zakmediaai/api/octopus-ai-model-intel"
      }
    });
  }

  // PUBLIC: /models
  if (path === "/models") {
    let models = await getModels(env);
    models = [...models].sort((a,b) => a.input_cost_per_mtok - b.input_cost_per_mtok);
    if (isPaid) {
      const p = url.searchParams.get("provider");
      const s = url.searchParams.get("status");
      const v = url.searchParams.get("vision");
      if (p) models = models.filter(m => m.provider === p.toLowerCase());
      if (s) models = models.filter(m => m.status   === s.toLowerCase());
      if (v === "true") models = models.filter(m => m.supports_vision);
    }
    return json({ count: models.length, data_source: models[0]?.source || "seed", models });
  }

  // PUBLIC: /pricing
  if (path === "/pricing") {
    const models = await getModels(env);
    const pricing = [...models]
      .sort((a,b) => a.input_cost_per_mtok - b.input_cost_per_mtok)
      .map(m => ({
        provider:             m.provider,
        model:                m.model,
        input_cost_per_mtok:  m.input_cost_per_mtok,
        output_cost_per_mtok: m.output_cost_per_mtok,
        cost_per_1k_in:       Math.round(m.input_cost_per_mtok  / 1000 * 100000) / 100000,
        cost_per_1k_out:      Math.round(m.output_cost_per_mtok / 1000 * 100000) / 100000,
        context_window:       m.context_window,
        value_score:          valueScore(m),
        last_updated:         m.last_updated,
      }));
    return json({ count: pricing.length, data_source: models[0]?.source || "seed", pricing });
  }

  // PREMIUM GATE
  if (!isPaid) {
    return json({
      error:          "Premium endpoint. Subscribe on RapidAPI for access.",
      subscribe:      "https://rapidapi.com/zakmediaai/api/octopus-ai-model-intel",
      free_endpoints: ["/models", "/pricing", "/health"],
    }, 403);
  }

  // PREMIUM: /models/:provider
  const pm = path.match(/^\/models\/([a-zA-Z0-9_-]+)$/);
  if (pm) {
    const models = await getModels(env);
    const p = pm[1].toLowerCase();
    const r = models.filter(m => m.provider === p).sort((a,b) => a.input_cost_per_mtok - b.input_cost_per_mtok);
    if (!r.length) return json({ error: `No models found for provider: ${p}` }, 404);
    return json({ provider: p, count: r.length, models: r });
  }

  // PREMIUM: /compare
  if (path === "/compare") {
    const param = url.searchParams.get("models");
    if (!param) return json({ error: "Missing ?models= e.g. /compare?models=gpt-4o,claude-3.5-sonnet-20241022" }, 400);
    const models = await getModels(env);
    const names  = param.split(",").map(s => s.trim().toLowerCase());
    const found  = names.map(n => models.find(m =>
      m.model.toLowerCase() === n ||
      m.model.toLowerCase().includes(n) ||
      (m.model_id || "").toLowerCase().includes(n)
    ));
    const miss = names.filter((_,i) => !found[i]);
    if (miss.length) return json({ error: `Models not found: ${miss.join(", ")}. Try /search?q=modelname` }, 400);
    const comp = found.map(m => ({ ...m, value_score: valueScore(m) }));
    return json({
      models: comp,
      winners: {
        cheapest_input:  [...comp].sort((a,b) => a.input_cost_per_mtok - b.input_cost_per_mtok)[0].model,
        largest_context: [...comp].sort((a,b) => b.context_window - a.context_window)[0].model,
        best_value:      [...comp].sort((a,b) => b.value_score - a.value_score)[0].model,
      }
    });
  }

  // PREMIUM: /cheapest
  if (path === "/cheapest") {
    const task   = (url.searchParams.get("task") || "chat").toLowerCase();
    const models = await getModels(env);
    let pool = [...models], rationale = "";
    if      (task === "vision")       { pool = pool.filter(m => m.supports_vision); rationale = "Vision-capable models"; }
    else if (task === "code")         { pool = pool.filter(m => m.supports_functions && ["openai","anthropic","mistral","google"].includes(m.provider)); rationale = "Top code-capable models"; }
    else if (task === "long-context") { pool = pool.sort((a,b) => b.context_window - a.context_window).slice(0,5); rationale = "Largest context windows"; }
    else if (task === "fast")         { pool = pool.filter(m => /flash|mini|haiku|small|nemo|nano/.test(m.model.toLowerCase())); rationale = "Fast lightweight models"; }
    else                              { rationale = "All models sorted by best value"; }
    const recs = pool.sort((a,b) => a.input_cost_per_mtok - b.input_cost_per_mtok).slice(0,5).map(m => ({ ...m, value_score: valueScore(m) }));
    return json({ task, rationale, recommendations: recs });
  }

  // PREMIUM: /providers
  if (path === "/providers") {
    const models = await getModels(env);
    const ps = [...new Set(models.map(m => m.provider))].map(p => {
      const pm    = models.filter(m => m.provider === p);
      const costs = pm.map(m => m.input_cost_per_mtok);
      return {
        provider:        p,
        status:          "operational",
        model_count:     pm.length,
        cheapest_input:  Math.min(...costs),
        most_expensive:  Math.max(...costs),
        max_context:     Math.max(...pm.map(m => m.context_window || 0)),
        has_vision:      pm.some(m => m.supports_vision),
        models:          pm.map(m => m.model),
        last_checked:    new Date().toISOString(),
      };
    });
    return json({ count: ps.length, providers: ps });
  }

  // PREMIUM: /search
  if (path === "/search") {
    const q = (url.searchParams.get("q") || "").toLowerCase().trim();
    if (!q) return json({ error: "Missing ?q= e.g. /search?q=claude" }, 400);
    const models = await getModels(env);
    const r = models.filter(m =>
      m.model.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q) ||
      (m.model_family || "").toLowerCase().includes(q) ||
      (m.notes || "").toLowerCase().includes(q) ||
      (m.model_id || "").toLowerCase().includes(q)
    );
    return json({ query: q, count: r.length, models: r });
  }

  return json({ error: "Not found. Call /health for valid endpoints." }, 404);
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};
