// Vercel cron: Expire sponsorships past their end date (runs daily at midnight)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jkoxrftlslylfmugjomd.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprb3hyZnRsc2x5bGZtdWdqb21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjAzNTEsImV4cCI6MjA5MzM5NjM1MX0.1LVo1a2K2V8QZPX94bVTBmzIxUskKp0mR7RmNwgOdcI';

export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    const now = new Date().toISOString();

    // Find active sponsorships past their end date
    const pg = await fetch(
      `${SUPABASE_URL}/rest/v1/sponsorships?select=id&is_active=eq.true&end_date=lte.${now}`,
      { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
    );

    if (!pg.ok) throw new Error('Failed to query expired sponsorships');

    const expired = await pg.json();

    if (expired.length === 0) {
      return new Response(JSON.stringify({ success: true, expired: 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Batch expire them
    for (const s of expired) {
      await fetch(`${SUPABASE_URL}/rest/v1/sponsorships?id=eq.${s.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          is_active: false,
          payment_status: 'expired',
          updated_at: now
        })
      });
    }

    return new Response(JSON.stringify({ success: true, expired: expired.length }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Cron error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
