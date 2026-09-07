const TOKEN = '1689137e-ad63-4609-a490-b911958af7aa';
const PRJ = 'c565ecb1-3a02-4ab1-8505-5624c42c3f07';
const ENV = 'f3ce8037-b6ed-4a45-be22-040b85c81706';
const REDIS_SVC = '5b18989b-8d0a-49e3-87f9-96ba08b15cd6';
const FORUM_SVC = '41a0afe9-e43f-41fb-878b-c89c2854d444';
const API = 'https://backboard.railway.app/graphql/v2';

const gql = async (q, v = {}) => {
  const r = await fetch(API, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q, variables: v }) });
  return r.json();
};

const d = await gql('query($p:String!,$e:String!,$s:String!){variables(projectId:$p,environmentId:$e,serviceId:$s)}', { p: PRJ, e: ENV, s: REDIS_SVC });
const vars = d.data?.variables;
console.log('Redis vars:', JSON.stringify(vars));

const domain = vars?.RAILWAY_PRIVATE_DOMAIN;
if (domain) {
  const redisUrl = `redis://${domain}:6379`;
  console.log('REDIS_URL:', redisUrl);

  // Update forum-api
  const d2 = await gql('mutation($i:VariableUpsertInput!){variableUpsert(input:$i)}', { i: { projectId: PRJ, environmentId: ENV, serviceId: FORUM_SVC, name: 'REDIS_URL', value: redisUrl } });
  console.log('REDIS_URL updated for forum-api:', d2.data?.variableUpsert);
} else {
  console.log('Private domain not ready yet. Retry in 30s.');
}
