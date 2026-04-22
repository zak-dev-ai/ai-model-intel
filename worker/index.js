/**
 * 🐙 OCTOPUS AI MODEL INTEL
 * Cloudflare Worker — RapidAPI ready with key protection
 */

const MODELS = [
  // OpenAI
  { provider:"openai", model:"gpt-4o",              model_family:"GPT-4o",   input_cost_per_mtok:2.50,  output_cost_per_mtok:10.00, context_window:128000,   release_date:"2024-05-13", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:4096,   notes:"Flagship multimodal model" },
  { provider:"openai", model:"gpt-4o-mini",          model_family:"GPT-4o",   input_cost_per_mtok:0.15,  output_cost_per_mtok:0.60,  context_window:128000,   release_date:"2024-07-18", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:16384,  notes:"Fast and affordable" },
  { provider:"openai", model:"gpt-4-turbo",          model_family:"GPT-4",    input_cost_per_mtok:10.00, output_cost_per_mtok:30.00, context_window:128000,   release_date:"2024-04-09", status:"ga",      supports_vision:true,  supports_functions:true,  max_output_tokens:4096,   notes:"Predecessor to GPT-4o" },
  { provider:"openai", model:"gpt-3.5-turbo",        model_family:"GPT-3.5",  input_cost_per_mtok:0.50,  output_cost_per_mtok:1.50,  context_window:16385,    release_date:"2022-11-30", status:"ga",      supports_vision:false, supports_functions:true,  max_output_tokens:4096,   notes:"Legacy, still widely used" },
  { provider:"openai", model:"o1",                   model_family:"o1",       input_cost_per_mtok:15.00, output_cost_per_mtok:60.00, context_window:200000,   release_date:"2024-12-17", status:"ga",      supports_vision:true,  supports_functions:false, max_output_tokens:100000, notes:"Advanced reasoning" },
  { provider:"openai", model:"o3-mini",              model_family:"o3",       input_cost_per_mtok:1.10,  output_cost_per_mtok:4.40,  context_window:200000,   release_date:"2025-01-31", status:"ga",      supports_vision:false, supports_functions:true,  max_output_tokens:100000, notes:"Cost-efficient reasoning" },
  // Anthropic
  { provider:"anthropic", model:"claude-3-5-sonnet-20241022", model_family:"Claude 3.5", input_cost_per_mtok:3.00,  output_cost_per_mtok:15.00, context_window:200000, release_date:"2024-10-22", status:"ga", supports_vision:true,  supports_functions:true,  max_output_tokens:8192, notes:"Best overall Anthropic model" },
  { provider:"anthropic", model:"claude-3-5-haiku-20241022",  model_family:"Claude 3.5", input_cost_per_mtok:0.80,  output_cost_per_mtok:4.00,  context_window:200000, release_date:"2024-11-05", status:"ga", supports_vision:true,  supports_functions:true,  max_output_tokens:8192, notes:"Fastest Anthropic model" },
  { provider:"anthropic", model:"claude-3-opus-20240229",     model_family:"Claude 3",   input_cost_per_mtok:15.00, output_cost_per_mtok:75.00, context_window:200000, release_date:"2024-02-29", status:"ga", supports_vision:true,  supports_functions:true,  max_output_tokens:4096, notes:"Most powerful Claude 3" },
  { provider:"anthropic", model:"claude-3-haiku-20240307",    model_family:"Claude 3",   input_cost_per_mtok:0.25,  output_cost_per_mtok:1.25,  context_window:200000, release_date:"2024-03-07", status:"ga", supports_vision:true,  supports_functions:true,  max_output_tokens:4096, notes:"Fastest Claude 3" },
  // Google
  { provider:"google", model:"gemini-2.5-pro",   model_family:"Gemini 2.5", input_cost_per_mtok:1.25,  output_cost_per_mtok:5.00, context_window:1048576, release_date:"2025-03-25", status:"preview", supports_vision:true,  supports_functions:true, max_output_tokens:65536, notes:"1M context, thinking model" },
  { provider:"google", model:"gemini-2.5-flash", model_family:"Gemini 2.5", input_cost_per_mtok:0.15,  output_cost_per_mtok:0.60, context_window:1048576, release_date:"2025-05-01", status:"preview", supports_vision:true,  supports_functions:true, max_output_tokens:65536, notes:"Fast Gemini 2.5 variant" },
  { provider:"google", model:"gemini-2.0-flash", model_family:"Gemini 2.0", input_cost_per_mtok:0.10,  output_cost_per_mtok:0.40, context_window:1048576, release_date:"2025-02-05", status:"ga",      supports_vision:true,  supports_functions:true, max_output_tokens:8192,  notes:"Fast and cheap, 1M context" },
  { provider:"google", model:"gemini-1.5-pro",   model_family:"Gemini 1.5", input_cost_per_mtok:1.25,  output_cost_per_mtok:5.00, context_window:2097152, release_date:"2024-05-24", status:"ga",      supports_vision:true,  supports_functions:true, max_output_tokens:8192,  notes:"2M token context window" },
  { provider:"google", model:"gemini-1.5-flash", model_family:"Gemini 1.5", input_cost_per_mtok:0.075, output_cost_per_mtok:0.30, context_window:1048576, release_date:"2024-05-24", status:"ga",      supports_vision:true,  supports_functions:true, max_output_tokens:8192,  notes:"Best budget price-performance" },
  // Mistral
  { provider:"mistral", model:"mistral-large-2411", model_family:"Mistral Large", input_cost_per_mtok:2.00, output_cost_per_mtok:6.00, context_window:128000, release_date:"2024-11-18", status:"ga", supports_vision:false, supports_functions:true,  max_output_tokens:4096, notes:"Flagship Mistral" },
  { provider:"mistral", model:"mistral-small-2409", model_family:"Mistral Small", input_cost_per_mtok:0.20, output_cost_per_mtok:0.60, context_window:32000,  release_date:"2024-09-18", status:"ga", supports_vision:false, supports_functions:true,  max_output_tokens:4096, notes:"Efficient and affordable" },
  { provider:"mistral", model:"codestral-2405",     model_family:"Codestral",     input_cost_per_mtok:0.20, output_cost_per_mtok:0.60, context_window:32000,  release_date:"2024-05-29", status:"ga", supports_vision:false, supports_functions:false, max_output_tokens:4096, notes:"Specialized for code" },
  { provider:"mistral", model:"mistral-nemo",       model_family:"Mistral Nemo",  input_cost_per_mtok:0.15, output_cost_per_mtok:0.15, context_window:128000, release_date:"2024-07-18", status:"ga", supports_vision:false, supports_functions:true,  max_output_tokens:4096, notes:"Small but powerful" },
  // xAI
  { provider:"xai", model:"grok-2-1212",        model_family:"Grok 2", input_cost_per_mtok:2.00, output_cost_per_mtok:10.00, context_window:131072, release_date:"2024-12-12", status:"ga", supports_vision:false, supports_functions:true, max_output_tokens:131072, notes:"xAI flagship" },
  { provider:"xai", model:"grok-2-vision-1212", model_family:"Grok 2", input_cost_per_mtok:2.00, output_cost_per_mtok:10.00, context_window:32768,  release_date:"2024-12-12", status:"ga", supports_vision:true,  supports_functions:true, max_output_tokens:32768,  notes:"Grok with vision" },
  // Meta
  { provider:"meta", model:"llama-3.3-70b-instruct",  model_family:"Llama 3.3", input_cost_per_mtok:0.23, output_cost_per_mtok:0.40, context_window:128000, release_date:"2024-12-06", status:"ga", supports_vision:false, supports_functions:true, max_output_tokens:8192, notes:"Best open-source model" },
  { provider:"meta", model:"llama-3.1-405b-instruct", model_family:"Llama 3.1", input_cost_per_mtok:0.90, output_cost_per_mtok:0.90, context_window:128000, release_date:"2024-07-23", status:"ga", supports_vision:false, supports_functions:true, max_output_tokens:4096, notes:"Largest open-source model" },
];

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
  const x = Math.log10(m.context_window / 1000 + 1);
  return Math.round((c * 0.6 + x * 0.4) * 1000) / 1000;
}

function isRapidAPIRequest(request, env) {
  const secret = request.headers.get("X-RapidAPI-Proxy-Secret");
  if (!secret) return false;
  if (env?.RAPIDAPI_SECRET) return secret === env.RAPIDAPI_SECRET;
  return true;
}

async function handleRequest(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url    = new URL(request.url);
  const path   = url.pathname.replace(/\/$/, "") || "/";
  const isPaid = isRapidAPIRequest(request, env);

  // PUBLIC: /health or /
  if (path === "/" || path === "/health") {
    return json({
      status: "operational",
      api: "Octopus AI Model Intel",
      models_count: MODELS.length,
      providers: [...new Set(MODELS.map(m => m.provider))],
      last_updated: new Date().toISOString(),
      access: isPaid ? "full" : "teaser",
      endpoints: {
        public:  ["GET /models", "GET /pricing", "GET /health"],
        premium: ["GET /models/{provider}", "GET /compare", "GET /cheapest", "GET /providers", "GET /search"],
        subscribe: "https://rapidapi.com/zakmediaai/api/octopus-ai-model-intel"
      }
    });
  }

  // PUBLIC: /models
  if (path === "/models") {
    let results = [...MODELS].sort((a,b) => a.input_cost_per_mtok - b.input_cost_per_mtok);
    if (isPaid) {
      const p = url.searchParams.get("provider");
      const s = url.searchParams.get("status");
      const v = url.searchParams.get("vision");
      if (p) results = results.filter(m => m.provider === p.toLowerCase());
      if (s) results = results.filter(m => m.status === s.toLowerCase());
      if (v === "true") results = results.filter(m => m.supports_vision);
    }
    return json({ count: results.length, models: results });
  }

  // PUBLIC: /pricing
  if (path === "/pricing") {
    const results = [...MODELS]
      .sort((a,b) => a.input_cost_per_mtok - b.input_cost_per_mtok)
      .map(m => ({
        provider: m.provider, model: m.model,
        input_cost_per_mtok: m.input_cost_per_mtok,
        output_cost_per_mtok: m.output_cost_per_mtok,
        cost_per_1k_in:  Math.round(m.input_cost_per_mtok  / 1000 * 100000) / 100000,
        cost_per_1k_out: Math.round(m.output_cost_per_mtok / 1000 * 100000) / 100000,
        context_window: m.context_window,
        value_score: valueScore(m),
      }));
    return json({ count: results.length, pricing: results });
  }

  // PREMIUM GATE
  if (!isPaid) {
    return json({
      error: "Premium endpoint. Subscribe on RapidAPI for access.",
      subscribe: "https://rapidapi.com/zakmediaai/api/octopus-ai-model-intel",
      free_endpoints: ["/models", "/pricing", "/health"],
    }, 403);
  }

  // PREMIUM: /models/:provider
  const pm = path.match(/^\/models\/([a-zA-Z0-9_-]+)$/);
  if (pm) {
    const p = pm[1].toLowerCase();
    const r = MODELS.filter(m => m.provider === p).sort((a,b) => a.input_cost_per_mtok - b.input_cost_per_mtok);
    if (!r.length) return json({ error: `Unknown provider: ${p}` }, 400);
    return json({ provider: p, count: r.length, models: r });
  }

  // PREMIUM: /compare
  if (path === "/compare") {
    const param = url.searchParams.get("models");
    if (!param) return json({ error: "Missing ?models= e.g. /compare?models=gpt-4o,claude-3.5-sonnet-20241022" }, 400);
    const names  = param.split(",").map(s => s.trim().toLowerCase());
    const found  = names.map(n => MODELS.find(m => m.model.toLowerCase() === n));
    const miss   = names.filter((_,i) => !found[i]);
    if (miss.length) return json({ error: `Not found: ${miss.join(", ")}` }, 400);
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
    const task = (url.searchParams.get("task") || "chat").toLowerCase();
    let pool = [...MODELS], rationale = "";
    if (task === "vision")       { pool = pool.filter(m => m.supports_vision); rationale = "Vision-capable models"; }
    else if (task === "code")    { pool = pool.filter(m => m.supports_functions && ["openai","anthropic","mistral","google"].includes(m.provider)); rationale = "Top code-capable models"; }
    else if (task === "long-context") { pool = pool.sort((a,b) => b.context_window - a.context_window).slice(0,5); rationale = "Largest context windows"; }
    else if (task === "fast")    { pool = pool.filter(m => /flash|mini|haiku|small|nemo/.test(m.model)); rationale = "Fast lightweight models"; }
    else                         { rationale = "All models by best value"; }
    const recs = pool.sort((a,b) => a.input_cost_per_mtok - b.input_cost_per_mtok).slice(0,5).map(m => ({ ...m, value_score: valueScore(m) }));
    return json({ task, rationale, recommendations: recs });
  }

  // PREMIUM: /providers
  if (path === "/providers") {
    const ps = [...new Set(MODELS.map(m => m.provider))].map(p => {
      const pm = MODELS.filter(m => m.provider === p);
      const costs = pm.map(m => m.input_cost_per_mtok);
      return { provider: p, status: "operational", model_count: pm.length,
        cheapest_input: Math.min(...costs), most_expensive: Math.max(...costs),
        max_context: Math.max(...pm.map(m => m.context_window)),
        has_vision: pm.some(m => m.supports_vision),
        models: pm.map(m => m.model), last_checked: new Date().toISOString() };
    });
    return json({ count: ps.length, providers: ps });
  }

  // PREMIUM: /search
  if (path === "/search") {
    const q = (url.searchParams.get("q") || "").toLowerCase().trim();
    if (!q) return json({ error: "Missing ?q= e.g. /search?q=gpt" }, 400);
    const r = MODELS.filter(m => m.model.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.model_family?.toLowerCase().includes(q) || m.notes?.toLowerCase().includes(q));
    return json({ query: q, count: r.length, models: r });
  }

  return json({ error: "Not found. Call /health for valid endpoints." }, 404);
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};
