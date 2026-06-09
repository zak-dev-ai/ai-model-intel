const DEFAULT_CONFIG = {
  site: {
    name: 'AI Model Ranks',
    domain: 'https://www.aimodelranks.live',
    rapidapi: 'https://octopus-ai-model-intel.rapidapi.com',
    refTag: 'aimodelranks' // Your referral tag
  },
  referrals: {
    // Major AI providers — official API consoles
    'openai': 'https://platform.openai.com/api-keys',
    '~openai': 'https://platform.openai.com/api-keys',
    'anthropic': 'https://console.anthropic.com/',
    '~anthropic': 'https://console.anthropic.com/',
    'google': 'https://aistudio.google.com/app/apikey',
    '~google': 'https://aistudio.google.com/app/apikey',
    'mistral': 'https://console.mistral.ai/',
    'meta': 'https://llama.meta.com/',
    'meta-llama': 'https://llama.meta.com/',
    'deepseek': 'https://platform.deepseek.com/',
    'xai': 'https://console.x.ai/',
    'x-ai': 'https://console.x.ai/',
    'cohere': 'https://dashboard.cohere.com/',
    'perplexity': 'https://docs.perplexity.ai/',
    'groq': 'https://console.groq.com/',
    'together': 'https://api.together.xyz/',
    'fireworks': 'https://fireworks.ai/',
    'openrouter': 'https://openrouter.ai/',
    // Enterprise & Cloud
    'amazon': 'https://aws.amazon.com/bedrock/',
    'microsoft': 'https://azure.microsoft.com/en-us/products/ai-services/',
    'ibm-granite': 'https://www.ibm.com/granite',
    'nvidia': 'https://build.nvidia.com/explore/discover',
    // Chinese AI Labs
    'alibaba': 'https://www.alibabacloud.com/en/solutions/generative-ai/qwen',
    'qwen': 'https://chat.qwen.ai/',
    'baidu': 'https://yiyan.baidu.com/',
    'bytedance': 'https://www.volcengine.com/product/doubao',
    'bytedance-seed': 'https://team.doubao.com/',
    'tencent': 'https://cloud.tencent.com/product/hunyuan',
    'xiaomi': 'https://www.xiaomiev.com/',
    'moonshot': 'https://platform.moonshot.cn/',
    '~moonshotai': 'https://platform.moonshot.cn/',
    'z-ai': 'https://z.ai/',
    'minimax': 'https://www.minimaxi.com/',
    'stepfun': 'https://platform.stepfun.com/',
    // Open source & research labs
    'allenai': 'https://allenai.org/',
    'nex-agi': 'https://nex-agi.com/',
    'inception': 'https://www.inceptionlabs.ai/',
    'liquid': 'https://www.liquid.ai/',
    'poolside': 'https://www.poolside.ai/',
    'primeintellect': 'https://www.primeintellect.ai/',
    'rekaai': 'https://www.reka.ai/',
    'ai21': 'https://www.ai21.com/',
    'upstage': 'https://www.upstage.ai/',
    'writer': 'https://writer.com/',
    'essentialai': 'https://www.essential.ai/',
    'perceptron': 'https://www.perceptron.ai/',
    'inflection': 'https://inflection.ai/',
    'aion-labs': 'https://aionlabs.com/',
    'deepcogito': 'https://deepcogito.com/',
    'morph': 'https://www.morph.so/',
    'inclusionai': 'https://inclusion.ai/',
    'kwaipilot': 'https://mancer.tech/',
    'mancer': 'https://mancer.tech/',
    'arthropod': 'https://arthropod.ai/',
    'switchpoint': 'https://switchpoint.io/',
    'relace': 'https://relace.ai/',
    // Community & open source
    'nous': 'https://nousresearch.com/',
    'anthracite-org': 'https://huggingface.co/anthracite-org',
    'cognitivecomputations': 'https://cognitivecomputations.com/',
    'gryphe': 'https://huggingface.co/Gryphe',
    'sao10k': 'https://huggingface.co/Sao10K',
    'thedrummer': 'https://huggingface.co/TheDrummer',
    'undi95': 'https://huggingface.co/Undi95',
    // Other tools
    'cursor': 'https://cursor.sh',
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
    let url = DEFAULT_CONFIG.referrals[key] || null;
    
    // Fallback: try to guess provider website, otherwise use OpenRouter model page
    if (!url) {
      url = `https://openrouter.ai/models?q=${encodeURIComponent(provider)}`;
    }
    
    // Auto-append referral tag only for known providers
    if (url && url !== '#' && DEFAULT_CONFIG.referrals[key]) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}ref=${DEFAULT_CONFIG.site.refTag}`;
    }
    
    return url;
  },
  getRapidApiUrl: () => DEFAULT_CONFIG.site.rapidapi
};
