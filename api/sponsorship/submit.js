// Vercel Serverless: Save sponsorship submission & redirect to Dodo payment
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jkoxrftlslylfmugjomd.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprb3hyZnRsc2x5bGZtdWdqb21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjAzNTEsImV4cCI6MjA5MzM5NjM1MX0.1LVo1a2K2V8QZPX94bVTBmzIxUskKp0mR7RmNwgOdcI';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await req.json();
    const { company_name, contact_name, contact_email, website_url, model_name, description, logo_url } = body;

    if (!company_name || !contact_name || !contact_email || !website_url || !model_name || !description) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const pg = await fetch(`${SUPABASE_URL}/rest/v1/sponsorships`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        company_name,
        contact_name,
        contact_email,
        website_url,
        model_name,
        description: description.slice(0, 200),
        logo_url: logo_url || null,
        payment_status: 'pending',
        start_date: startDate,
        end_date: endDate,
        is_active: false
      })
    });

    if (!pg.ok) {
      const err = await pg.text();
      throw new Error(`Supabase insert failed: ${err}`);
    }

    const [record] = await pg.json();

    return new Response(JSON.stringify({ success: true, sponsorship_id: record.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Sponsorship submit error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
