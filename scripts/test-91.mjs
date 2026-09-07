/**
 * Send exactly 91 requests as fast as possible.
 * The 91st should return 429 if rate limiter is single-instance.
 */
const BASE = 'https://forum-api-production-26d4.up.railway.app';
const TOTAL = 91;

console.log(`Sending ${TOTAL} requests as fast as possible...`);

let remaining_prev = 90;
for (let i = 1; i <= TOTAL; i++) {
  const r = await fetch(`${BASE}/threads/test-${i}`);
  const remaining = r.headers.get('ratelimit-remaining');
  const limit = r.headers.get('ratelimit-limit');

  if (r.status === 429) {
    const body = await r.json();
    console.log(`\n✅ Request #${i}: HTTP 429 RATE LIMITED!`);
    console.log('Body:', JSON.stringify(body));
    console.log(`ratelimit-remaining: ${remaining}`);
    break;
  }

  // Show every 10 and when remaining changes
  if (i <= 5 || i % 10 === 0 || parseInt(remaining) < 5) {
    console.log(`#${i}: ${r.status} | limit=${limit} remaining=${remaining}`);
  }
}
console.log('\nDone.');
