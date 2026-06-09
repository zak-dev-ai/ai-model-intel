// Ticker — client-side only, this API is no longer needed
// The ticker now fetches directly from rss2json.com in the browser
export default async function handler() {
  return new Response(JSON.stringify({ posts: [], note: 'Client-side ticker is active' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
