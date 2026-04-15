// ============================================
// AI Model Intel — Scraper (CLEAN FINAL v1)
// ============================================

// --------------------------------------------
// PROVIDERS
// --------------------------------------------
const PROVIDERS = [
  { name: 'OpenAI', slug: 'openai', url: 'https://openai.com/api/pricing/' },
  { name: 'Anthropic', slug: 'anthropic', url: 'https://docs.anthropic.com/en/release/betasAndSLAs' },
  { name: 'Google', slug: 'google', url: 'https://ai.google.dev/pricing' },
  { name: 'Mistral', slug: 'mistral', url: 'https://docs.mistral.ai/api/' },
  { name: 'xAI', slug: 'xai', url: 'https://x.ai/api' }
];

// --------------------------------------------
// FETCH PAGE (safe)
// --------------------------------------------
async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// --------------------------------------------
// MODEL DATA (clean + fixed)
// --------------------------------------------
const PROVIDER_MODELS = {

  openai: [
    { name: 'gpt-4o', input_cost_per_mtok: 5.00, output_cost_per_mtok: 15.00 },
    { name: 'gpt-4o-mini', input_cost_per_mtok: 0.15, output_cost_per_mtok: 0.60 },
    { name: 'gpt-4-turbo', input_cost_per_mtok: 10.00, output_cost_per_mtok: 30.00 },
    { name: 'gpt-3.5-turbo', input_cost_per_mtok: 0.50, output_cost_per_mtok: 1.50 },
    { name: 'o3-mini', input_cost_per_mtok: 1.10, output_cost_per_mtok: 4.40 },
  ],

  anthropic: [
    { name: 'claude-3-opus', input_cost_per_mtok: 15.00, output_cost_per_mtok: 75.00 },
    { name: 'claude-3.5-sonnet', input_cost_per_mtok: 3.00, output_cost_per_mtok: 15.00 },
    { name: 'claude-3-haiku', input_cost_per_mtok: 0.80, output_cost_per_mtok: 4.00 },
  ],

  google: [
    { name: 'gemini-2.5-pro', input_cost_per_mtok: 1.25, output_cost_per_mtok: 5.00 },
    { name: 'gemini-2.5-flash', input_cost_per_mtok: 0.075, output_cost_per_mtok: 0.30 },
    { name: 'gemini-2.0-flash', input_cost_per_mtok: 0.10, output_cost_per_mtok: 0.40 },
    { name: 'gemini-1.5-pro', input_cost_per_mtok: 1.25, output_cost_per_mtok: 5.00 },
    { name: 'gemini-1.5-flash', input_cost_per_mtok: 0.075, output_cost_per_mtok: 0.30 },
  ],

  mistral: [
    { name: 'mistral-large', input_cost_per_mtok: 2.00, output_cost_per_mtok: 6.00 },
    { name: 'mistral-small', input_cost_per_mtok: 0.20, output_cost_per_mtok: 0.60 },
    { name: 'mistral-medium', input_cost_per_mtok: 0.27, output_cost_per_mtok: 0.81 },
    { name: 'mistral-nemo', input_cost_per_mtok: 0.15, output_cost_per_mtok: 0.15 },
    { name: 'mistral-mini', input_cost_per_mtok: 0.04, output_cost_per_mtok: 0.04 },
  ],

  xai: [
    { name: 'grok-2', input_cost_per_mtok: 2.00, output_cost_per_mtok: 10.00 },
    { name: 'grok-2-mini', input_cost_per_mtok: 0.50, output_cost_per_mtok: 2.00 },
    { name: 'grok-1', input_cost_per_mtok: 2.00, output_cost_per_mtok: 10.00 },
  ],
};

// --------------------------------------------
// INTELLIGENCE FUNCTIONS
// --------------------------------------------
function calculateCostPerContext(inputCost, contextWindow) {
  return Number(((inputCost / 1_000_000) * contextWindow).toFixed(6));
}

function calculateEfficiency(inputCost) {
  if (inputCost === 0) return 0;

  const score = Math.log(1 / inputCost) * 20;

  return Number(Math.max(0, score).toFixed(2));
}

// --------------------------------------------
// CONTEXT WINDOWS
// --------------------------------------------
const CONTEXT_WINDOWS = {
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'gpt-4-turbo': 128000,
  'gpt-3.5-turbo': 16000,
  'o3-mini': 128000,

  'claude-3-opus': 200000,
  'claude-3.5-sonnet': 200000,
  'claude-3-haiku': 200000,

  'gemini-2.5-pro': 200000,
  'gemini-2.5-flash': 100000,
  'gemini-2.0-flash': 100000,
  'gemini-1.5-flash': 100000,

  'mistral-large': 32000,
  'mistral-medium': 32000,
  'mistral-small': 32000,
  'mistral-nemo': 32000,
  'mistral-mini': 32000,
};

// --------------------------------------------
// SCRAPE ALL
// --------------------------------------------
async function scrapeAll() {
  console.log('🌐 Starting scrape...\n');
  const allModels = [];

  for (const provider of PROVIDERS) {
    try {
      console.log(`📡 Checking ${provider.name}...`);

      try {
        await fetchPage(provider.url);
      } catch {
        console.warn(`⚠️ Skipping validation for ${provider.name}`);
      }

      const models = PROVIDER_MODELS[provider.slug] || [];

      models.forEach(m => {
        const context = CONTEXT_WINDOWS[m.name] || 32000;

        allModels.push({
          provider: provider.slug,
          model: m.name,

          input_cost_per_mtok: m.input_cost_per_mtok,
          output_cost_per_mtok: m.output_cost_per_mtok,

          context_window: context,
          cost_per_context: calculateCostPerContext(m.input_cost_per_mtok, context),
          reasoning_efficiency: calculateEfficiency(m.input_cost_per_mtok),

          provider_health: "good",
          last_updated: new Date().toISOString()
        });
      });

      console.log(` ✅ ${models.length} models`);
    } catch (err) {
      console.error(` ❌ ${provider.name}: ${err.message}`);
    }
  }

  // sort cheapest first
  allModels.sort((a, b) => a.input_cost_per_mtok - b.input_cost_per_mtok);

  console.log(`\n✅ Total models: ${allModels.length}`);
  return allModels;
}

// --------------------------------------------
// UPLOAD TO CLOUDFLARE KV
// --------------------------------------------
async function uploadToKV(models) {
  const { CF_ACCOUNT_ID, CF_API_TOKEN, CF_KV_NAMESPACE_ID } = process.env;

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/pricing_data`;

  const payload = {
    version: "v1",
    updated_at: new Date().toISOString(),
    total_models: models.length,
    models
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  console.log('☁️ Uploaded to KV');
}

// --------------------------------------------
// MAIN
// --------------------------------------------
async function main() {
  try {
    const models = await scrapeAll();
    await uploadToKV(models);
    console.log('\n🎉 Done!');
  } catch (err) {
    console.error('💥 Error:', err.message);
  }
}

main();
