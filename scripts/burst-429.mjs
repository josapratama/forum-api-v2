/**
 * Burst test - kirim 200 request berturut-turut (bukan paralel)
 * untuk memastikan per-IP counter dihitung benar
 */
const BASE = 'https://forum-api-production-26d4.up.railway.app';

console.log('Bursting 200 sequential requests to /threads/test...\n');

let count429 = 0, count404 = 0;
let firstHit = null;

for (let i = 1; i <= 200; i++) {
  const r = await fetch(`${BASE}/threads/burst-test`);
  if (r.status === 429) {
    count429++;
    if (!firstHit) {
      firstHit = i;
      const body = await r.json();
      console.log(`#${i}: HTTP 429! ✅`);
      console.log('Body:', JSON.stringify(body));
      const remaining = r.headers.get('ratelimit-remaining');
      const reset = r.headers.get('ratelimit-reset');
      console.log(`ratelimit-remaining: ${remaining}`);
      console.log(`ratelimit-reset: ${reset}`);
    }
  } else {
    count404++;
    if (i <= 5 || i % 20 === 0) {
      const remaining = r.headers.get('ratelimit-remaining');
      console.log(`#${i}: ${r.status} | remaining: ${remaining}`);
    }
  }
  if (count429 >= 5) break; // Cukup, sudah terbukti
}

console.log(`\n=== RESULT: 404=${count404}, 429=${count429} ===`);
console.log(count429 > 0 ? '✅ Rate limit WORKS!' : '❌ No 429 received');
