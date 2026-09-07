const TOKEN = '1689137e-ad63-4609-a490-b911958af7aa';
const PRJ = 'c565ecb1-3a02-4ab1-8505-5624c42c3f07';
const ENV = 'f3ce8037-b6ed-4a45-be22-040b85c81706';
const API = 'https://backboard.railway.app/graphql/v2';

const gql = async (query, variables = {}) => {
  const r = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
};

// Create Redis service
const d1 = await gql(
  'mutation($i:ServiceCreateInput!){serviceCreate(input:$i){id name}}',
  { i: { projectId: PRJ, name: 'Redis', source: { image: 'redis:7-alpine' } } }
);
console.log('Redis service:', JSON.stringify(d1.data));

const redisId = d1.data?.serviceCreate?.id;
if (!redisId) {
  console.log('Failed to create Redis. Response:', JSON.stringify(d1));
  process.exit(1);
}

// Get Redis private domain  
const d2 = await gql(
  'query($p:String!,$e:String!,$s:String!){variables(projectId:$p,environmentId:$e,serviceId:$s)}',
  { p: PRJ, e: ENV, s: redisId }
);
const vars = d2.data?.variables;
const redisDomain = vars?.RAILWAY_PRIVATE_DOMAIN;
console.log('Redis private domain:', redisDomain);
console.log('REDIS_URL will be: redis://' + redisDomain + ':6379');

// Set REDIS_URL for forum-api service
const SVC = '41a0afe9-e43f-41fb-878b-c89c2854d444';
const redisUrl = `redis://${redisDomain}:6379`;
const d3 = await gql(
  'mutation($i:VariableUpsertInput!){variableUpsert(input:$i)}',
  { i: { projectId: PRJ, environmentId: ENV, serviceId: SVC, name: 'REDIS_URL', value: redisUrl } }
);
console.log('REDIS_URL set:', JSON.stringify(d3.data));
