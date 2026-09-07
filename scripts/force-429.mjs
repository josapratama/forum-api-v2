/**
 * Force 429 by sending 100 requests in rapid succession
 */
const BASE = 'https://forum-api-production-26d4.up.railway.app';

console.log('Sending 100 PARALLEL requests simultaneously...');

// Send all 100 at once
const start = Date.now();
const results = await Promise.all(
  Array.from({ length: 100 }, (_, i) =>
    fetch(`${BASE}/threads/test${i}`)
      .then(async r => {
        const body = r.status === 429 ? await r.json() : null;
        return { status: r.status, body };
      })
  )
);
const elapsed = Date.now() - start;

const counts = results.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] || 0) + 1;
  return acc;
}, {});

console.log(`Completed in ${elapsed}ms`);
console.log('Results:', JSON.stringify(counts));

const sample429 = results.find(r => r.status === 429);
if (sample429) {
  console.log('\n✅ 429 Response body:', JSON.stringify(sample429.body));
  console.log('Rate limiting is working correctly!');
} else {
  console.log('\nNo 429 yet. Sending another 20 requests...');
  const extra = await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      fetch(`${BASE}/threads/extra${i}`).then(async r => {
        const body = r.status === 429 ? await r.json() : null;
        return { status: r.status, body };
      })
    )
  );
  const s429 = extra.find(r => r.status === 429);
  if (s429) {
    console.log('✅ 429 Response body:', JSON.stringify(s429.body));
  } else {
    const remaining = await fetch(`${BASE}/threads/remaining`).then(r => ({
      status: r.status,
      remaining: r.headers.get('ratelimit-remaining'),
      limit: r.headers.get('ratelimit-limit'),
    }));
    console.log('Headers:', remaining);
  }
}
