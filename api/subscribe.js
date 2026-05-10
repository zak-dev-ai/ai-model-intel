// Email subscription endpoint for ai-model-intel
// Requires SB_SERVICE_KEY env var on Vercel

const SB_REF = 'jkoxrftlslylfmugjomd';
const SB_URL = `https://${SB_REF}.supabase.co`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const SB_KEY = process.env.SB_SERVICE_KEY;
  if (!SB_KEY) return res.status(500).json({ error: 'Server not configured' });
  
  try {
    const { email } = req.body || {};
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });
    
    await fetch(`${SB_URL}/rest/v1/alerts`, {
      method: 'POST',
      headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ level: 'info', source: 'newsletter', message: email })
    });
    
    return res.status(200).json({ success: true, message: 'Subscribed!' });
  } catch (err) {
    return res.status(200).json({ success: true, message: 'Subscribed!' });
  }
}
