const DEFAULT_CONFIG = {
  site: {
    name: 'AI Model Ranks',
    domain: 'https://www.aimodelranks.live',
    rapidapi: 'https://octopus-ai-model-intel.rapidapi.com',
    refTag: 'aimodelranks' // Your referral tag
  },
  referrals: {
    'openai': 'https://platform.openai.com/api-keys',
    'anthropic': 'https://console.anthropic.com/',
    'google': 'https://aistudio.google.com/app/apikey',
    'mistral': 'https://console.mistral.ai/',
    'groq': 'https://console.groq.com/',
    'together': 'https://api.together.xyz/',
    'openrouter': 'https://openrouter.ai/',
    'fireworks': 'https://fireworks.ai/',
    'deepseek': 'https://platform.deepseek.com/',
    'xai': 'https://console.x.ai/',
    'cohere': 'https://dashboard.cohere.com/',
    'meta': 'https://llama.meta.com/',
    'cursor': 'https://cursor.sh',
    'perplexity': 'https://perplexity.ai',
    'github': 'https://github.com/features/copilot',
    'replit': 'https://replit.com',
    'pinecone': 'https://www.pinecone.io/',
    'weaviate': 'https://weaviate.io/',
    'langsmith': 'https://smith.langchain.com/',
    'helicone': 'https://helicone.ai/'
  },
  sponsorships: {
    enterprise: { price: 'Contact Sales', features: ['Hero Placement', 'API Routing Integration', 'Newsletter Feature'] },
    growth: { price: 'Contact Sales', features: ['Sidebar Placement', 'Category Sponsorship'] },
    starter: { price: 'Contact Sales', features: ['Directory Listing', 'Standard Badge'] }
  }
};

window.ConfigManager = {
  get: () => DEFAULT_CONFIG,
  getReferral: (provider) => {
    const key = (provider || '').toLowerCase().trim();
    let url = DEFAULT_CONFIG.referrals[key] || DEFAULT_CONFIG.referrals['openrouter'] || '#';
    
    // Auto-append referral tag
    if (url && url !== '#') {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}ref=${DEFAULT_CONFIG.site.refTag}`;
    }
    
    return url;
  },
  getRapidApiUrl: () => DEFAULT_CONFIG.site.rapidapi
};
