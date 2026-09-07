/**
 * Test rate limiting dengan request paralel
 * Kirim 95 request SEKALIGUS untuk memastikan 429 ter-trigger
 */
const BASE = 'https://forum-api-production-26d4.up.railway.app';

console.log('Sending 95 CONCURRENT requests to /threads/xxx...\n');

const promises = Array.from({ length: 95 }, (_, i) =>
  fetch(`${BASE}/threads/xxx-${i}`)
    .then(r => ({ status: r.status, index: i + 1 }))
    .catch(e => ({ status: 'error', index: i + 1, error: e.message }))
);

const results = await Promise.all(promises);

const count = { 200: 0, 404: 0, 429: 0, other: 0 };
let first429 = null;
results.forEach(r => {
  if (r.status === 429 && !first429) first429 = r.index;
  if (count[r.status] !== undefined) count[r.status]++;
  else count.other++;
});

console.log('=== CONCURRENT TEST RESULT ===');
console.log(`404 responses : ${count[404]}`);
console.log(`429 responses : ${count[429]}`);
console.log(`Other         : ${count.other}`);
console.log(`First 429 at  : request #${first429 || 'none'}`);
console.log('');

if (count[429] > 0) {
  console.log('✅ Rate limiting WORKS! Returns 429 when limit exceeded.');
  // Show a 429 response body
  const r429 = await fetch(`${BASE}/threads/test`, {
    headers: { 'X-Test': 'rate-limit-body-check' }
  });
  // Force exceed by sending many more
  const extras = await Promise.all(
    Array.from({ length: 10 }, () => fetch(`${BASE}/threads/extra`))
  );
  const extra429 = extras.filter(r => r.status === 429);
  if (extra429.length > 0) {
    const body = await extra429[0].json();
    console.log('429 Response body:', JSON.stringify(body));
  }
} else {
  console.log('⚠️  No 429 received yet. Check headers:');
  // Show remaining from last request
  const r = await fetch(`${BASE}/threads/check-remaining`);
  const remaining = r.headers.get('ratelimit-remaining');
  const limit = r.headers.get('ratelimit-limit');
  console.log(`  ratelimit-limit    : ${limit}`);
  console.log(`  ratelimit-remaining: ${remaining}`);
  console.log(`  Status: ${r.status}`);
  if (parseInt(remaining) <= 5) {
    console.log('  → Counter almost exhausted, rate limiting is active!');
  }
}
