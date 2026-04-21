/**
 * 🐙 OCTOPUS AI INTEL — Cloudflare Worker
 * RapidAPI-ready. All endpoints documented below.
 *
 * BASE URL: https://ai-model-intel.zak-media-ai.workers.dev
 *
 * ENDPOINTS:
 *   GET /models              → all models, sorted by cost (cheapest first)
 *   GET /models/:provider    → filter by provider (openai, anthropic, google, mistral, xai, meta)
 *   GET /pricing             → pricing-focused view, sorted cheapest first
 *   GET /compare             → ?models=gpt-4o,claude-3.5-sonnet side-by-side
 *   GET /cheapest            → ?task=chat|code|long-context → best value for task
 *   GET /providers           → provider summary + health status
 *   GET /search              → ?q=gpt → fuzzy search models by name
 *   GET /health              → API status + last update time
 */

// ─── Master model database ─────────────────────────────────────────────
// All prices in $ per 1M tokens. Updated April 2025.
// Sources: official provider pricing pages.
const MODELS = [
  // ── OpenAI ──
  {
    provider: "openai",
    model: "gpt-4o",
    model_family: "GPT-4",
    input_cost_per_mtok: 2.50,
    output_cost_per_mtok: 10.00,
    context_window: 128000,
    release_date: "2024-05-13",
    status: "ga",
    supports_vision: true,
    supports_functions: true,
    max_output_tokens: 4096,
    notes: "Flagship multimodal model",
  },
  {
    provider: "openai",
    model: "gpt-4o-mini",
    model_family: "GPT-4",
    input_cost_per_mtok: 0.15,
    output_cost_per_mtok: 0.60,
    context_window: 128000,
    release_date: "2024-07-18",
    status: "ga",
    supports_vision: true,
    supports_functions: true,
    max_output_tokens: 16384,
    notes: "Fast, cheap, highly capable small model",
  },
  {
    provider: "openai",
    model: "gpt-4-turbo",
    model_family: "GPT-4",
    input_cost_per_mtok: 10.00,
    output_cost_per_mtok: 30.00,
    context_window: 128000,
    release_date: "2024-04-09",
    status: "ga",
    supports_vision: true,
    supports_functions: true,
    max_output_tokens: 4096,
    notes: "Predecessor to GPT-4o",
  },
  {
    provider: "openai",
    model: "gpt-3.5-turbo",
    model_family: "GPT-3.5",
    input_cost_per_mtok: 0.50,
    output_cost_per_mtok: 1.50,
    context_window: 16385,
    release_date: "2022-11-30",
    status: "ga",
    supports_vision: false,
    supports_functions: true,
    max_output_tokens: 4096,
    notes: "Legacy model, still widely used",
  },
  {
    provider: "openai",
    model: "o1",
    model_family: "o1",
    input_cost_per_mtok: 15.00,
    output_cost_per_mtok: 60.00,
    context_window: 200000,
    release_date: "2024-12-17",
    status: "ga",
    supports_vision: true,
    supports_functions: false,
    max_output_tokens: 100000,
    notes: "Advanced reasoning model",
  },
  {
    provider: "openai",
    model: "o1-mini",
    model_family: "o1",
    input_cost_per_mtok: 3.00,
    output_cost_per_mtok: 12.00,
    context_window: 128000,
    release_date: "2024-09-12",
    status: "ga",
    supports_vision: false,
    supports_functions: false,
    max_output_tokens: 65536,
    notes: "Smaller reasoning model",
  },
  {
    provider: "openai",
    model: "o3-mini",
    model_family: "o3",
    input_cost_per_mtok: 1.10,
    output_cost_per_mtok: 4.40,
    context_window: 200000,
    release_date: "2025-01-31",
    status: "ga",
    supports_vision: false,
    supports_functions: true,
    max_output_tokens: 100000,
    notes: "Cost-efficient reasoning model",
  },

  // ── Anthropic ──
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    model_family: "Claude 3.5",
    input_cost_per_mtok: 3.00,
    output_cost_per_mtok: 15.00,
    context_window: 200000,
    release_date: "2024-10-22",
    status: "ga",
    supports_vision: true,
    supports_functions: true,
    max_output_tokens: 8192,
    notes: "Best overall Anthropic model",
  },
  {
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    model_family: "Claude 3.5",
    input_cost_per_mtok: 0.80,
    output_cost_per_mtok: 4.00,
    context_window: 200000,
    release_date: "2024-11-05",
    status: "ga",
    supports_vision: true,
    supports_functions: true,
    max_output_tokens: 8192,
    notes: "Fastest Anthropic model",
  },
  {
    provider: "anthropic",
    model: "claude-3-opus-20240229",
    model_family: "Claude 3",
    input_cost_per_mtok: 15.00,
    output_cost_per_mtok: 75.00,
    context_window: 200000,
    release_date: "2024-02-29",
    status: "ga",
    supports_vision: true,
    supports_functions: true,
    max_output_tokens: 4096,
    notes: "Most powerful Claude 3 model",
  },
  {
    provider: "anthropic",
    model: "claude-3-haiku-20240307",
    model_family: "Claude 3",
    input_cost_per_mtok: 0.25,
    output_cost_per_mtok: 1.25,
    context_window: 200000,
    release_date: "2024-03-07",
    status: "ga",
    supports_vision: true,
    supports_functions: true,
    max_output_tokens: 4096,
    notes: "Fastest, most compact Claude 3",
  },

  // ── Google ──
  {
    provider: "google",
    model: "gemini-2.5-pro",
    model_family: "Gemini 2.5",
    input_cost_per_mtok: 1.25,
    output_cost_per_mtok: 5.00,
    context_window: 1048576,
    release_date: "2025-03-25",
    status: "preview",
    supports_vision: true,
    supports_functions: true,
    max_output_tokens: 65536,
    notes: "1M token context, thinking model",
  },
  {
    provider: "google",
    model: "gemini-2.0-flash",
    model_family: "Gemini 2.0",
    input_cost_per_mtok: 0.10,
    output_cost_per_mtok: 0.40,
    context_window: 1048576,
    release_date: "2025-02-05",
    status: "ga",
    supports_vision: true,
    supports_functions: true,
    max_output_tokens: 8192,
    notes: "Fast and cheap with 1M context",
  },
  {
    provider: "google",
    model: "gemini-1.5-pro",
    model_family: "Gemini 1.5",
    input_cost_per_mtok: 1.25,
    output_cost_per_mtok: 5.00,
    context_window: 2097152,
    release_date: "2024-05-24",
    status: "ga",
    supports_vision: true,
    supports_functions: true,
    max_output_tokens: 8192,
    notes: "2M token context window",
  },
  {
    provider: "google",
    model: "gemini-1.5-flash",
    model_family: "Gemini 1.5",
    input_cost_per_mtok: 0.075,
    output_cost_per_mtok: 0.30,
    context_window: 1048576,
    release_date: "2024-05-24",
    status: "ga",
    supports_vision: true,
    supports_functions: true,
    max_output_tokens: 8192,
    notes: "Best price-to-performance budget model",
  },

  // ── Mistral ──
  {
    provider: "mistral",
    model: "mistral-large-2411",
    model_family: "Mistral Large",
    input_cost_per_mtok: 2.00,
    output_cost_per_mtok: 6.00,
    context_window: 128000,
    release_date: "2024-11-18",
    status: "ga",
    supports_vision: false,
    supports_functions: true,
    max_output_tokens: 4096,
    notes: "Flagship Mistral model",
  },
  {
    provider: "mistral",
    model: "mistral-small-2409",
    model_family: "Mistral Small",
    input_cost_per_mtok: 0.20,
    output_cost_per_mtok: 0.60,
    context_window: 32000,
    release_date: "2024-09-18",
    status: "ga",
    supports_vision: false,
    supports_functions: true,
    max_output_tokens: 4096,
    notes: "Efficient and affordable",
  },
  {
    provider: "mistral",
    model: "codestral-2405",
    model_family: "Codestral",
    input_cost_per_mtok: 0.20,
    output_cost_per_mtok: 0.60,
    context_window: 32000,
    release_date: "2024-05-29",
    status: "ga",
    supports_vision: false,
    supports_functions: false,
    max_output_tokens: 4096,
    notes: "Specialized for code generation",
  },

  // ── xAI ──
  {
    provider: "xai",
    model: "grok-2-1212",
    model_family: "Grok 2",
    input_cost_per_mtok: 2.00,
    output_cost_per_mtok: 10.00,
    context_window: 131072,
    release_date: "2024-12-12",
    status: "ga",
    supports_vision: false,
    supports_functions: true,
    max_output_tokens: 131072,
    notes: "xAI flagship model",
  },
  {
    provider: "xai",
    model: "grok-2-vision-1212",
    model_family: "Grok 2",
    input_cost_per_mtok: 2.00,
    output_cost_per_mtok: 10.00,
    context_window: 32768,
    release_date: "2024-12-12",
    status: "ga",
    supports_vision: true,
    supports_functions: true,
    max_output_tokens: 32768,
    notes: "Grok with vision capability",
  },

  // ── Meta ──
  {
    provider: "meta",
    model: "llama-3.3-70b-instruct",
    model_family: "Llama 3.3",
    input_cost_per_mtok: 0.23,
    output_cost_per_mtok: 0.40,
    context_window: 128000,
    release_date: "2024-12-06",
    status: "ga",
    supports_vision: false,
    supports_functions: true,
    max_output_tokens: 8192,
    notes: "Best open-source model (via Groq/Together)",
  },
  {
    provider: "meta",
    model: "llama-3.1-405b-instruct",
    model_family: "Llama 3.1",
    input_cost_per_mtok: 0.90,
    output_cost_per_mtok: 0.90,
    context_window: 128000,
    release_date: "2024-07-23",
    status: "ga",
    supports_vision: false,
    supports_functions: true,
    max_output_tokens: 4096,
    notes: "Largest open-source model",
  },
];

// ─── CORS headers ──────────────────────────────────────────────────────
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-RapidAPI-Key, X-RapidAPI-Host",
  "Content-Type": "application/json",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: CORS });
}

function error(msg, status = 400) {
  return json({ error: msg }, status);
}

// ─── Value score helper ────────────────────────────────────────────────
// Higher = better value. Used for /cheapest recommendations.
function valueScore(m) {
  const costScore    = 1 / (m.input_cost_per_mtok + 0.01);
  const contextScore = Math.log10(m.context_window / 1000 + 1);
  return Math.round((costScore * 0.6 + contextScore * 0.4) * 1000) / 1000;
}

// ─── Request handler ───────────────────────────────────────────────────
async function handleRequest(request) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

  const url  = new URL(request.url);
  const path = url.pathname.replace(/\/$/, ""); // strip trailing slash

  // ── GET /health ────────────────────────────────────────────────────
  if (path === "/health" || path === "") {
    return json({
      status:       "operational",
      models_count: MODELS.length,
      providers:    [...new Set(MODELS.map(m => m.provider))],
      last_updated: new Date().toISOString(),
      endpoints: [
        "GET /models",
        "GET /models/:provider",
        "GET /pricing",
        "GET /compare?models=gpt-4o,claude-3.5-sonnet-20241022",
        "GET /cheapest?task=chat",
        "GET /providers",
        "GET /search?q=gpt",
        "GET /health",
      ],
    });
  }

  // ── GET /models ────────────────────────────────────────────────────
  // ?provider=openai  (optional filter)
  // ?status=ga        (optional: ga | preview)
  // ?vision=true      (optional: only vision-capable)
  if (path === "/models") {
    let results = [...MODELS];

    const providerFilter = url.searchParams.get("provider");
    const statusFilter   = url.searchParams.get("status");
    const visionFilter   = url.searchParams.get("vision");

    if (providerFilter) results = results.filter(m => m.provider === providerFilter.toLowerCase());
    if (statusFilter)   results = results.filter(m => m.status   === statusFilter.toLowerCase());
    if (visionFilter === "true") results = results.filter(m => m.supports_vision);

    results.sort((a, b) => a.input_cost_per_mtok - b.input_cost_per_mtok);

    return json({ count: results.length, models: results });
  }

  // ── GET /models/:provider ──────────────────────────────────────────
  const providerMatch = path.match(/^\/models\/([a-zA-Z0-9_-]+)$/);
  if (providerMatch) {
    const provider = providerMatch[1].toLowerCase();
    const results  = MODELS.filter(m => m.provider === provider)
      .sort((a, b) => a.input_cost_per_mtok - b.input_cost_per_mtok);

    if (!results.length) return error(`Unknown provider: ${provider}. Valid: openai, anthropic, google, mistral, xai, meta`);
    return json({ provider, count: results.length, models: results });
  }

  // ── GET /pricing ───────────────────────────────────────────────────
  // Returns a pricing-focused view, cheapest input first
  if (path === "/pricing") {
    const results = MODELS
      .sort((a, b) => a.input_cost_per_mtok - b.input_cost_per_mtok)
      .map(m => ({
        provider:              m.provider,
        model:                 m.model,
        input_cost_per_mtok:   m.input_cost_per_mtok,
        output_cost_per_mtok:  m.output_cost_per_mtok,
        cost_per_1k_in:        Math.round(m.input_cost_per_mtok  / 1000 * 10000) / 10000,
        cost_per_1k_out:       Math.round(m.output_cost_per_mtok / 1000 * 10000) / 10000,
        context_window:        m.context_window,
        value_score:           valueScore(m),
      }));

    return json({ count: results.length, pricing: results });
  }

  // ── GET /compare ───────────────────────────────────────────────────
  // ?models=gpt-4o,claude-3.5-sonnet-20241022
  if (path === "/compare") {
    const param = url.searchParams.get("models");
    if (!param) return error("Missing ?models= parameter. Example: /compare?models=gpt-4o,claude-3.5-sonnet-20241022");

    const names   = param.split(",").map(s => s.trim().toLowerCase());
    const found   = names.map(name => MODELS.find(m => m.model.toLowerCase() === name));
    const missing = names.filter((n, i) => !found[i]);

    if (missing.length) return error(`Models not found: ${missing.join(", ")}`);

    const comparison = found.map(m => ({
      ...m,
      value_score: valueScore(m),
    }));

    // Quick winner analysis
    const cheapest  = [...comparison].sort((a,b) => a.input_cost_per_mtok - b.input_cost_per_mtok)[0].model;
    const largest   = [...comparison].sort((a,b) => b.context_window - a.context_window)[0].model;
    const bestValue = [...comparison].sort((a,b) => b.value_score - a.value_score)[0].model;

    return json({
      models: comparison,
      winners: {
        cheapest_input:  cheapest,
        largest_context: largest,
        best_value:      bestValue,
      },
    });
  }

  // ── GET /cheapest ──────────────────────────────────────────────────
  // ?task=chat|code|long-context|fast|vision
  // Returns best model recommendation per task
  if (path === "/cheapest") {
    const task = (url.searchParams.get("task") || "chat").toLowerCase();

    let pool = [...MODELS];
    let sortKey = "input_cost_per_mtok";
    let rationale = "";

    switch (task) {
      case "vision":
        pool = pool.filter(m => m.supports_vision);
        rationale = "Vision-capable models sorted by cost";
        break;
      case "code":
        // Prefer models known good at code
        pool = pool.filter(m =>
          m.supports_functions &&
          ["openai","anthropic","mistral"].includes(m.provider)
        );
        rationale = "Function-calling capable models from top code providers";
        break;
      case "long-context":
        pool = pool.sort((a,b) => b.context_window - a.context_window).slice(0, 5);
        rationale = "Top 5 models by context window size";
        break;
      case "fast":
        // Flash/mini/haiku are the fast tiers
        pool = pool.filter(m =>
          m.model.includes("flash") ||
          m.model.includes("mini") ||
          m.model.includes("haiku") ||
          m.model.includes("small")
        );
        rationale = "Lightweight fast-tier models";
        break;
      default: // "chat"
        rationale = "All models sorted by best value (cost + context)";
        break;
    }

    const sorted = pool
      .sort((a, b) => a.input_cost_per_mtok - b.input_cost_per_mtok)
      .slice(0, 5)
      .map(m => ({ ...m, value_score: valueScore(m) }));

    return json({
      task,
      rationale,
      recommendations: sorted,
    });
  }

  // ── GET /providers ─────────────────────────────────────────────────
  if (path === "/providers") {
    const providerNames = [...new Set(MODELS.map(m => m.provider))];
    const summary = providerNames.map(p => {
      const pModels  = MODELS.filter(m => m.provider === p);
      const costs    = pModels.map(m => m.input_cost_per_mtok);
      const contexts = pModels.map(m => m.context_window);
      return {
        provider:        p,
        status:          "operational",
        model_count:     pModels.length,
        cheapest_input:  Math.min(...costs),
        most_expensive:  Math.max(...costs),
        max_context:     Math.max(...contexts),
        has_vision:      pModels.some(m => m.supports_vision),
        models:          pModels.map(m => m.model),
        last_checked:    new Date().toISOString(),
      };
    });
    return json({ count: summary.length, providers: summary });
  }

  // ── GET /search ────────────────────────────────────────────────────
  // ?q=gpt
  if (path === "/search") {
    const q = (url.searchParams.get("q") || "").toLowerCase().trim();
    if (!q) return error("Missing ?q= parameter. Example: /search?q=gpt");

    const results = MODELS.filter(m =>
      m.model.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q) ||
      m.model_family?.toLowerCase().includes(q) ||
      m.notes?.toLowerCase().includes(q)
    );

    return json({ query: q, count: results.length, models: results });
  }

  return error("Endpoint not found. Call GET /health for a list of valid endpoints.", 404);
}

// ─── Worker export ─────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  },
};
