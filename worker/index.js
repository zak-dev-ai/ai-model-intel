// ============================================
// AI Model Intel — Cloudflare Worker
// Serves pricing data from KV store
// ============================================

const MODEL_CATEGORIES = {
openai: 'OpenAI',
anthropic: 'Anthropic',
google: 'Google',
mistral: 'Mistral',
xai: 'xAI',
meta: 'Meta'
};

// ============================================
// CORS headers
// ============================================
function corsHeaders() {
return {
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'GET, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type',
'Content-Type': 'application/json'
};
}

function handleOptions(request) {
return new Response(null, {
headers: corsHeaders()
});
}

// ============================================
// Fetch all models from KV
// ============================================
async function getAllModels(env) {
const data = await env.AI_MODELS_KV.get('pricing_data', 'json');
return data || { models: [], updated_at: null };
}

// ============================================
// GET /pricing — all models, cheapest first
// ============================================
async function handlePricing(env) {
const { models } = await getAllModels(env);
const sorted = [...models].sort((a, b) => a.input_cost_per_mtok - b.input_cost_per_mtok);
return new Response(JSON.stringify(sorted), { headers: corsHeaders() });
}

// ============================================
// GET /models/:provider — just one provider
// ============================================
async function handleProvider(provider, env) {
const { models } = await getAllModels(env);
const filtered = models.filter(m => m.provider.toLowerCase() === provider.toLowerCase());
return new Response(JSON.stringify(filtered), { headers: corsHeaders() });
}

// ============================================
// GET /compare?models=gpt-4o,claude-sonnet-4
// ============================================
async function handleCompare(url, env) {
const { models } = await getAllModels(env);
const names = url.searchParams.get('models')?.split(',').map(n => n.trim().toLowerCase()) || [];
if (!names.length) {
return new Response(JSON.stringify({ error: 'Provide models param, e.g. ?models=gpt-4o,claude-sonnet-4' }), { headers: corsHeaders() });
}
const filtered = models.filter(m => names.includes(m.name.toLowerCase()));
return new Response(JSON.stringify(filtered), { headers: corsHeaders() });
}

// ============================================
// GET /cheapest?tier=mini
// ============================================
async function handleCheapest(url, env) {
const { models } = await getAllModels(env);
const tier = url.searchParams.get('tier')?.toLowerCase();
if (!tier) {
return new Response(JSON.stringify({ error: 'Provide tier param, e.g. ?tier=mini' }), { headers: corsHeaders() });
}
const filtered = models.filter(m => m.name.toLowerCase().includes(tier));
if (!filtered.length) {
return new Response(JSON.stringify({ error: `No models found matching tier: ${tier}` }), { headers: corsHeaders() });
}
const cheapest = filtered.reduce((a, b) => a.input_cost_per_mtok < b.input_cost_per_mtok ? a : b);
return new Response(JSON.stringify(cheapest), { headers: corsHeaders() });
}

// ============================================
// GET /health — last update time
// ============================================
async function handleHealth(env) {
const data = await getAllModels(env);
return new Response(JSON.stringify({
status: 'ok',
updated_at: data.updated_at,
model_count: data.models?.length || 0
}), { headers: corsHeaders() });
}

// ============================================
// Main router
// ============================================
async function handleRequest(request, env) {
const url = new URL(request.url);
const path = url.pathname.replace(/^\/|\/$/g, '');
const method =
  request.method;
  if (method === 'OPTIONS') return handleOptions(request);

try {
if (path === 'pricing' || path === '') {
return handlePricing(env);
} else if (path === 'health') {
return handleHealth(env);
} else if (path.startsWith('models/')) {
const provider = path.replace('models/', '');
return handleProvider(provider, env);
} else if (path === 'compare') {
return handleCompare(url, env);
} else if (path === 'cheapest') {
return handleCheapest(url, env);
} else {
return new Response(JSON.stringify({
error: 'Not found',
endpoints: ['/pricing', '/models/:provider', '/compare?models=a,b', '/cheapest?tier=mini', '/health']
}), { status: 404, headers: corsHeaders() });
}
} catch (err) {
return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders() });
}
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};


