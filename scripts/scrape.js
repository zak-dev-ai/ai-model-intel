const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID;

async function updateKV(data) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/pricing_data`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (response.ok) {
    console.log("Successfully updated Cloudflare KV!");
  } else {
    const error = await response.text();
    console.error("Failed to update KV:", error);
    process.exit(1);
  }
}

// Example data structure - replace with your actual scraping logic
const modelData = {
  updated_at: new Date().toISOString(),
  models: [
    { name: "gpt-4o", provider: "OpenAI", input_cost_per_mtok: 5.00, output_cost_per_mtok: 15.00 },
    { name: "claude-3-5-sonnet", provider: "Anthropic", input_cost_per_mtok: 3.00, output_cost_per_mtok: 15.00 },
    { name: "gemini-1.5-pro", provider: "Google", input_cost_per_mtok: 3.50, output_cost_per_mtok: 10.50 }
  ]
};

updateKV(modelData);
