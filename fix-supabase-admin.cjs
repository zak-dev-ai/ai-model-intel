const fs = require('fs');
let code = fs.readFileSync('admin.html', 'utf8');

// Remove the localStorage-based analytics code I added earlier
code = code.replace(
  "document.getElementById(\"ana-views\").textContent = (parseInt(localStorage.getItem(\"octopus_pageviews\")||0)).toLocaleString();\n  document.getElementById(\"s-clicks\")",
  "document.getElementById(\"s-clicks\")"
);

// Add Supabase real analytics fetching function
code = code.replace(
  'function initAdmin() { trackPageView();',
  `async function fetchSupabaseAnalytics() {
  try {
    const SUPABASE_URL = 'https://jkoxrftlslylfmugjomd.supabase.co';
    const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprb3hyZnRsc2x5bGZtdWdqb21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjAzNTEsImV4cCI6MjA5MzM5NjM1MX0.1LVo1a2K2V8QZPX94bVTBmzIxUskKp0mR7RmNwgOdcI';
    
    // Total page views (all time)
    const r1 = await fetch(SUPABASE_URL + '/rest/v1/analytics?select=id', {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON }
    });
    const allViews = await r1.json();
    document.getElementById('ana-views').textContent = (allViews.length || 0).toLocaleString();
    document.getElementById('s-clicks').textContent = (allViews.length || 0).toLocaleString();

    // Last 7 days 
    const d7 = new Date(); d7.setDate(d7.getDate() - 7);
    const r2 = await fetch(SUPABASE_URL + '/rest/v1/analytics?select=id&created_at=gte.' + d7.toISOString(), {
      headers: { 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON }
    });
    const weekViews = await r2.json();
    document.getElementById('s-clicks').textContent = (weekViews.length || 0).toLocaleString();

    // Revenue estimate from active ads
    const ads = window.AdsManager ? AdsManager.load().filter(a => a.plan && a.plan !== 'default') : [];
    const activeAds = ads.filter(s => s.active).length;
    document.getElementById('ana-revenue').textContent = activeAds > 0 ? '\$' + (activeAds * 79) : '\$0';
    document.getElementById('s-revenue').textContent = activeAds > 0 ? '\$' + (activeAds * 79) : '\$0';
    
  } catch(e) { console.log('Analytics fetch:', e); }
}

function initAdmin() {'
);

// Call the fetch function in init
code = code.replace(
  'setTimeout(initAdmin, 0);',
  'setTimeout(function() { initAdmin(); fetchSupabaseAnalytics(); }, 0);'
);

// Also call it when admin panel loads directly
code = code.replace(
  'initAdmin();',
  'initAdmin(); fetchSupabaseAnalytics();'
);

fs.writeFileSync('admin.html', code, 'utf8');
console.log('Admin Supabase integration complete');
