/**
 * Verify rate limiting with Redis store is working
 * Sends 100 requests and checks for 429
 */
const BASE = 'https://forum-api-production-26d4.up.railway.app';

// Check if server has Redis rate limit (check startup log via API first)
const TOKEN = '1689137e-ad63-4609-a490-b911958af7aa';
const SVC = '41a0afe9-e43f-41fb-878b-c89c2854d444';
const ENV = 'f3ce8037-b6ed-4a45-be22-040b85c81706';

// Get latest logs
const r = await fetch('https://backboard.railway.app/graphql/v2', {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'query($s:String!,$e:String!){deployments(input:{serviceId:$s,environmentId:$e}){edges{node{id status}}}}',
    variables: { s: SVC, e: ENV },
  }),
});
const d = await r.json();
const did = d.data.deployments.edges[0].node.id;

const r2 = await fetch('https://backboard.railway.app/graphql/v2', {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'query($d:String!){deploymentLogs(deploymentId:$d){message}}',
    variables: { d: did },
  }),
});
const logs = await r2.json();
const redisLog = logs.data.deploymentLogs.find(l => l.message.includes('Rate limiter') || l.message.includes('Redis'));
console.log('Rate limiter log:', redisLog?.message || 'Not found (kode belum ter-deploy)');

// Test rate limit
console.log('\nSending 100 sequential requests...');
let count429 = 0, count404 = 0;
let firstHit = null;
for (let i = 1; i <= 100; i++) {
  const res = await fetch(`${BASE}/threads/verify-test`);
  if (res.status === 429) {
    count429++;
    if (!firstHit) {
      firstHit = i;
      const body = await res.json();
      console.log(`\n✅ #${i}: HTTP 429 RATE LIMITED!`);
      console.log('Body:', JSON.stringify(body));
    }
  } else {
    count404++;
    if (i % 20 === 0) {
      const rem = res.headers.get('ratelimit-remaining');
      console.log(`#${i}: ${res.status} | remaining=${rem}`);
    }
  }
  if (count429 >= 3) break;
}

console.log(`\nResult: 404=${count404}, 429=${count429}`);
console.log(count429 > 0 ? '✅ Rate limiting WORKS!' : '❌ Still not working - kode belum ter-deploy');
