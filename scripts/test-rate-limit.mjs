/**
 * Test rate limiting: kirim >90 request ke /threads dalam 1 menit
 * Expect: setelah request ke-91, server return HTTP 429
 */

const BASE = 'https://forum-api-production-26d4.up.railway.app';

// Register + login dulu
await fetch(`${BASE}/users`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'ratetest', password: 'secret', fullname: 'Rate Test' }),
});

const loginRes = await fetch(`${BASE}/authentications`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'ratetest', password: 'secret' }),
});
const { data } = await loginRes.json();
const token = data.accessToken;
console.log('Logged in, token acquired.');
console.log('Sending 95 GET requests to /threads/xxx (no auth needed for GET)...\n');

let count429 = 0;
let count200 = 0;
let count404 = 0;
let firstHit = null;

for (let i = 1; i <= 95; i++) {
  const r = await fetch(`${BASE}/threads/thread-test-id`, {
    method: 'GET',
  });
  
  if (r.status === 429) {
    count429++;
    if (!firstHit) {
      firstHit = i;
      console.log(`Request #${i}: HTTP 429 - Rate limit hit! ✓`);
      const body = await r.json();
      console.log('Response:', JSON.stringify(body));
    }
  } else if (r.status === 404) {
    count404++;
  } else if (r.status === 200) {
    count200++;
  }
  
  if (i % 10 === 0) {
    process.stdout.write(`  ${i} requests sent (200:${count200}, 404:${count404}, 429:${count429})\n`);
  }
}

console.log('\n=== RATE LIMIT TEST RESULT ===');
console.log(`Total requests: 95`);
console.log(`200 responses : ${count200}`);
console.log(`404 responses : ${count404}`);
console.log(`429 responses : ${count429}`);
console.log(`First 429 at  : request #${firstHit}`);
console.log(count429 > 0 ? '✅ Rate limiting WORKS - returns 429!' : '❌ Rate limiting NOT working - no 429 received');
