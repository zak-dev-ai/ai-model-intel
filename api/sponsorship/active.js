// Vercel Serverless: Return currently active sponsorship (or null)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jkoxrftlslylfmugjomd.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprb3hyZnRsc2x5bGZtdWdqb21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjAzNTEsImV4cCI6MjA5MzM5NjM1MX0.1LVo1a2K2V8QZPX94bVTBmzIxUskKp0mR7RmNwgOdcI';

export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    const now = new Date().toISOString();

    const pg = await fetch(
      `${SUPABASE_URL}/rest/v1/sponsorships?select=*&is_active=eq.true&payment_status=eq.completed&end_date=gte.${now}&order=created_at.desc&limit=3`,
      {
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`
        }
      }
    );

    if (!pg.ok) {
      const err = await pg.text();
      throw new Error(`Supabase query failed: ${err}`);
    }

    const data = await pg.json();
    const sponsorships = data || [];

    return new Response(JSON.stringify({ sponsorships }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Active sponsorship error:', error);
    return new Response(JSON.stringify({ sponsorships: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
