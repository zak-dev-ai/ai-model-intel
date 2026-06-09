// Vercel Edge Function: Enriched Model Intel from OpenRouter
// Pulls free OpenRouter API, enriches with categories & trending data
export const config = { runtime: 'edge' };

const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';

// Provider slug mapping
const PROVIDER_MAP = {
  openai: 'openai', anthropic: 'anthropic', google: 'google',
  meta: 'meta', mistralai: 'mistral', mistral: 'mistral',
  deepseek: 'deepseek', cohere: 'cohere', xai: 'xai',
  nvidia: 'nvidia', qwen: 'alibaba', alibaba: 'alibaba',
  perplexity: 'perplexity', amazon: 'amazon', microsoft: 'microsoft',
  nousresearch: 'nous', gryphe: 'gryphe', perplexity: 'perplexity',
  '01-ai': '01ai', moonshotai: 'moonshot', ai21: 'ai21',
  databricks: 'databricks', together: 'together', fireworks: 'fireworks',
  groq: 'groq', rekahq: 'reka', sail: 'sail',
  nex: 'nex-agi', liquid: 'liquid', targon: 'targon',
  cognitive: 'cognitive', pygmalionai: 'pygmalion',
  openchat: 'openchat', phind: 'phind', nous: 'nous',
  'undi-95': 'undi95', sophosympatheia: 'sophosympatheia',
  evilfreelancer: 'evilfreelancer', lyra: 'lyra',
  neversleep: 'neversleep', featherless: 'featherless',
  infermatic: 'infermatic', automix: 'automix',
  'raifle-ai': 'raifle', sao10k: 'sao10k',
  thedrummer: 'thedrummer', latitudegames: 'latitudegames',
  nothingiisreal: 'nothingiisreal', recursive: 'recursive',
  matthew: 'matthew', liminerity: 'liminerity',
  'cortical-io': 'cortical', sentientfoundation: 'sentient',
  cze: 'czekit', 'inference-dot-net': 'inference',
  innovera: 'innovera', minima: 'minima', fbl: 'fbl',
  aionlabs: 'aionlabs', rwkv: 'rwkv', alpindale: 'alpindale',
  'blaze-ai': 'blaze', tensorwave: 'tensorwave',
  ionet: 'ionet', 'prime-intellect': 'primeintellect',
  chutes: 'chutes', parasail: 'parasail', hyperbolic: 'hyperbolic',
  kwawn: 'kwawn', shuttleai: 'shuttleai', novita: 'novita',
  deepinfra: 'deepinfra', cloudflare: 'cloudflare',
  'hugging-face': 'huggingface', 'john-durbin': 'johndurbin',
  haizelabs: 'haizelabs', globecore: 'globecore',
  fluid: 'fluid', 'ai-valence': 'aivalence',
  'a-star': 'astar', teknium: 'teknium'
};

function getProvider(modelId) {
  if (!modelId) return 'unknown';
  const slug = modelId.split('/')[0].toLowerCase();
  return PROVIDER_MAP[slug] || slug;
}

function getCategories(arch) {
  if (!arch) return [];
  const mods = arch.input_modalities || [];
  // Normalize: map to our category names
  const cats = [];
  for (const m of mods) {
    const lower = m.toLowerCase();
    if (lower === 'text') cats.push('Text');
    else if (lower === 'image') cats.push('Image');
    else if (lower === 'audio') cats.push('Audio');
    else if (lower === 'video') cats.push('Video');
    else if (lower === 'file') cats.push('File');
  }
  return cats;
}

// Use-case tagging from model name + description
const USE_CASE_PATTERNS = [
  { tag: 'Programming', re: /programming|coding?|developer|copilot|cursor|coder|wizard|engineer|code llama|starcoder|deepseek.*coder|codeshell|codegemma|codestral|codeqwen|qwen.*coder|dev(|el)/i },
  { tag: 'Roleplay', re: /roleplay|rp\b|character|storytell|creative writing|narrative|fiction|novel|imagination|rpg|chatbot|companion|waifu/i },
  { tag: 'Marketing', re: /market(?:ing)?|advertise|campaign|copywrit|brand|seo\b|content.*(creator|writer|generator)|social media/i },
  { tag: 'SEO', re: /\bseo\b|search engine|keyword|serp|backlink|ranking.*optim/i },
  { tag: 'Technology', re: /tech(?:nology)?|\bai\b|machine learning|deep learning|neural|transformer|llm\b|open source|opensource/i },
  { tag: 'Science', re: /scien(?:ce|tific)|research|biology|chemistry|physics|math(?:ematics)?|quantum|astronomy|lab|experiment|scientific/i },
  { tag: 'Translation', re: /translat(?:e|ion)|multilingual|polyglot|language.*pair|i18n|l10n|bilingual|cross.lingual/i },
  { tag: 'Legal', re: /legal|law|attorney|legislat|court|contract|compliance|regulatory|gdpr/i },
  { tag: 'Finance', re: /financ(?:e|ial)|trading|stock|market|invest|banking|crypto|blockchain|defi|portfolio|wealth/i },
  { tag: 'Health', re: /health|medical|clinical|diagnos(?:is|tic)|patient|doctor|pharma|drug|therapy|surgery|hospital|disease|medic(?:al|ine)|anatomy/i },
  { tag: 'Trivia', re: /trivia|quiz|general knowledge|facts|q\&a|question.*answer/i },
  { tag: 'Academia', re: /academ(?:ic|ia)|education|teach|tutor|learning|university|college|school|scholar|research.*paper|essay/i }
];

function getUseCases(name, desc) {
  const text = ((name || '') + ' ' + (desc || '')).toLowerCase();
  const cases = [];
  for (const p of USE_CASE_PATTERNS) {
    if (p.re.test(text)) cases.push(p.tag);
  }
  return cases.length ? cases : ['Technology']; // default: most AI models are tech
}

function getSignal(isFree, price) {
  if (isFree) return '🆓 Free — no cost to use';
  if (price <= 0.1) return '💰 Ultra-budget tier — ideal for massive scale';
  if (price <= 0.5) return '💰 Budget tier — great value';
  if (price <= 2) return '⚡ Mid-range — balanced performance & price';
  if (price <= 10) return '🔥 Premium tier — top performance';
  return '💎 Enterprise tier — maximum capability';
}

function getTrendScore(model) {
  // Simple heuristic: newer models + those with more modalities score higher
  let score = 0;
  const created = model.created || 0;
  const ageDays = (Date.now()/1000 - created) / 86400;
  if (ageDays < 7) score += 50;
  else if (ageDays < 30) score += 30;
  else if (ageDays < 90) score += 15;
  else if (ageDays < 180) score += 5;

  const mods = (model.architecture?.input_modalities || []).length;
  score += mods * 3;

  const isFree = parseFloat(model.pricing?.prompt || '0') === 0;
  if (isFree) score += 10;

  return score;
}

export default async function handler(req) {
  try {
    // Check for cached response header
    const resp = await fetch(OPENROUTER_API, {
      headers: { 'User-Agent': 'AIModelRanks/1.0' }
    });

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: 'Upstream unavailable', count: 0, models: [] }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await resp.json();
    const rawModels = data.data || [];

    // Enrich and transform
    const models = rawModels
      .filter(m => m.id && !m.id.includes('deprecated') && !m.id.includes('expired') && !m.id.startsWith('openrouter/'))
      .map(m => {
        const promptPrice = parseFloat(m.pricing?.prompt || '0');
        const completionPrice = parseFloat(m.pricing?.completion || '0');
        const isFree = promptPrice === 0 && completionPrice === 0;
        const categories = getCategories(m.architecture);
        const useCases = getUseCases(m.name || '', m.description || '');
        const trendScore = getTrendScore(m);
        const provider = getProvider(m.id);

        // Calculate value score (higher = better value)
        // Context window per dollar of input cost
        const ctx = m.context_length || 0;
        const price = promptPrice || 0.001;
        const valueScore = isFree ? 100 : Math.min(100, Math.round((ctx / 1000 / price) * 10) / 10);

        return {
          id: m.id,
          provider,
          model: m.name || m.id,
          description: (m.description || '').substring(0, 200),
          input_cost_per_mtok: promptPrice,
          output_cost_per_mtok: completionPrice,
          cost_per_1k_in: promptPrice / 1000,
          cost_per_1k_out: completionPrice / 1000,
          context_window: ctx,
          max_output_tokens: m.top_provider?.max_completion_tokens || null,
          categories,
          use_cases: useCases,
          modality: m.architecture?.modality || 'text->text',
          is_free: isFree,
          value_score: valueScore,
          trend_score: trendScore,
          signal: getSignal(isFree, promptPrice),
          created: m.created || null,
          link: `https://openrouter.ai/${m.id}`
        };
      });

    // Sort by trend score then value
    models.sort((a, b) => b.trend_score - a.trend_score || b.value_score - a.value_score);

    // Assign ranks
    models.forEach((m, i) => { m.rank = i + 1; });

    return new Response(JSON.stringify({
      count: models.length,
      updated: new Date().toISOString(),
      source: 'openrouter',
      models
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600, s-maxage=600',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, count: 0, models: [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
