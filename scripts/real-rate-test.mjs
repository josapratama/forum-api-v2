/**
 * Real rate limit test - sends requests as fast as possible
 * using keep-alive connection to minimize latency
 */
const BASE = 'https://forum-api-production-12cc.up.railway.app';

console.log('Testing rate limit: 91 fast requests with keepalive...');
console.log(`Target: ${BASE}/threads/test\n`);

// Use fetch with keepalive
let count = 0;
let count429 = 0;
let prevRemaining = 90;
const startTime = Date.now();

for (let i = 1; i <= 91; i++) {
  try {
    const r = await fetch(`${BASE}/threads/ratetest`, {
      keepalive: true,
      signal: AbortSignal.timeout(5000),
    });
    count++;
    const remaining = parseInt(r.headers.get('ratelimit-remaining') || '90');

    if (r.status === 429) {
      count429++;
      const body = await r.json();
      const elapsed = Date.now() - startTime;
      console.log(`\n✅ Request #${i}: HTTP 429 after ${elapsed}ms`);
      console.log('Response:', JSON.stringify(body));
      break;
    }

    // Log when remaining decreases
    if (remaining < prevRemaining - 2 || i <= 3 || i === 91) {
      const elapsed = Date.now() - startTime;
      console.log(`#${i} [${elapsed}ms]: ${r.status} | remaining=${remaining}`);
      prevRemaining = remaining;
    }
  } catch (err) {
    console.log(`#${i}: Error - ${err.message}`);
    await new Promise(r => setTimeout(r, 100));
  }
}

const totalTime = Date.now() - startTime;
console.log(`\nCompleted ${count} requests in ${totalTime}ms (avg ${(totalTime/count).toFixed(0)}ms/req)`);
console.log(`429s: ${count429}`);
console.log(count429 > 0 ? '✅ Rate limit WORKS!' : '⚠️  No 429 - check if >90 requests hit same node');
