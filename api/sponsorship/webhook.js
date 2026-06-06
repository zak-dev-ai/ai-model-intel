// Vercel Serverless: Handle Dodo Payments webhook to activate sponsorship on payment
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jkoxrftlslylfmugjomd.supabase.co';
const SUPABASE_ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprb3hyZnRsc2x5bGZtdWdqb21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjAzNTEsImV4cCI6MjA5MzM5NjM1MX0.1LVo1a2K2V8QZPX94bVTBmzIxUskKp0mR7RmNwgOdcI';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await req.json();
    console.log('[Webhook] Received:', JSON.stringify(body).slice(0, 500));

    // Dodo sends various event types; we care about payment completions
    const event = body.event_type || body.event || body.type;
    const data = body.data || body;

    // Accept multiple event name formats
    const isComplete = ['payment.completed', 'payment.success', 'checkout.completed', 'subscription.created'].includes(event);

    if (!isComplete) {
      console.log('[Webhook] Ignoring event:', event);
      return new Response(JSON.stringify({ success: true, reason: `Event ${event} not actionable` }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Extract sponsorship_id from metadata (various possible locations)
    const sponsorshipId =
      data.metadata?.sponsorship_id ||
      data.custom_data?.sponsorship_id ||
      body.metadata?.sponsorship_id;

    if (!sponsorshipId) {
      console.log('[Webhook] No sponsorship_id found in payload. Keys:', Object.keys(body));
      return new Response(JSON.stringify({ error: 'No sponsorship_id in metadata' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    console.log(`[Webhook] Activating sponsorship: ${sponsorshipId}`);

    // Update sponsorship to active
    const pg = await fetch(`${SUPABASE_URL}/rest/v1/sponsorships?id=eq.${sponsorshipId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        payment_status: 'completed',
        payment_id: data.payment_id || data.id || null,
        amount_paid: data.amount || data.amount_total || 99.00,
        is_active: true,
        updated_at: new Date().toISOString()
      })
    });

    if (!pg.ok) {
      const err = await pg.text();
      throw new Error(`Supabase update failed: ${err}`);
    }

    console.log(`[Webhook] Sponsorship ${sponsorshipId} activated`);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[Webhook] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
