// Quick endpoint check - jika rate-limit aktif, request ke-91+ harus 429
const BASE = 'https://forum-api-production-26d4.up.railway.app';

// Test dengan mengirim 10 request cepat dulu
console.log('Sending 10 fast requests to /threads/xxx...');
const results = await Promise.all(
  Array.from({ length: 10 }, () =>
    fetch(`${BASE}/threads/xxx`).then(r => r.status)
  )
);
console.log('Status codes:', results.join(', '));

// Test apakah express-rate-limit module ada dengan check response header
const r = await fetch(`${BASE}/threads/xxx`);
const headers = Object.fromEntries(r.headers.entries());
console.log('\nResponse headers relevant to rate limit:');
['x-ratelimit-limit', 'x-ratelimit-remaining', 'ratelimit-limit', 'ratelimit-remaining', 'retry-after'].forEach(h => {
  if (headers[h]) console.log(`  ${h}: ${headers[h]}`);
});
console.log('Status:', r.status);
