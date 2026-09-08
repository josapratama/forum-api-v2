/**
 * Delete old forum-api service and create fresh one linked to GitHub repo
 */
const TOKEN = '1689137e-ad63-4609-a490-b911958af7aa';
const PRJ = 'c565ecb1-3a02-4ab1-8505-5624c42c3f07';
const ENV = 'f3ce8037-b6ed-4a45-be22-040b85c81706';
const OLD_SVC = '41a0afe9-e43f-41fb-878b-c89c2854d444';
const API = 'https://backboard.railway.app/graphql/v2';

const gql = async (q, v = {}) => {
  const r = await fetch(API, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q, variables: v }) });
  return r.json();
};

// Step 1: Get current env vars from old service to transfer
const vars = await gql('query($p:String!,$e:String!,$s:String!){variables(projectId:$p,environmentId:$e,serviceId:$s)}', { p: PRJ, e: ENV, s: OLD_SVC });
const envVars = vars.data?.variables;
console.log('Current env vars keys:', Object.keys(envVars || {}));

// Step 2: Delete old service
const del = await gql('mutation($id:String!){serviceDelete(id:$id)}', { id: OLD_SVC });
console.log('Delete old service:', JSON.stringify(del.data));

// Step 3: Wait a bit
await new Promise(r => setTimeout(r, 2000));

// Step 4: Create new service from GitHub
const create = await gql(
  'mutation($i:ServiceCreateInput!){serviceCreate(input:$i){id name}}',
  { i: { projectId: PRJ, name: 'forum-api', source: { repo: 'josapratama/forum-api-v2', branch: 'main' } } }
);
console.log('New service:', JSON.stringify(create.data));
const newSvcId = create.data?.serviceCreate?.id;

if (!newSvcId) {
  console.log('Failed to create service from GitHub. Error:', JSON.stringify(create));
  process.exit(1);
}

// Step 5: Transfer env vars
const keepVars = ['DATABASE_URL', 'NODE_ENV', 'HOST', 'PORT', 'ACCESS_TOKEN_KEY', 'REFRESH_TOKEN_KEY', 'ACCCESS_TOKEN_AGE', 'REDIS_URL'];
for (const key of keepVars) {
  if (envVars[key]) {
    const r = await gql('mutation($i:VariableUpsertInput!){variableUpsert(input:$i)}', { i: { projectId: PRJ, environmentId: ENV, serviceId: newSvcId, name: key, value: envVars[key] } });
    console.log(`Set ${key}:`, r.data?.variableUpsert);
  }
}

// Step 6: Create domain for new service
const dom = await gql('mutation($s:String!,$e:String!){serviceDomainCreate(input:{serviceId:$s,environmentId:$e}){domain}}', { s: newSvcId, e: ENV });
console.log('New domain:', JSON.stringify(dom.data));

console.log('\nNew service ID:', newSvcId);
console.log('Please update RAILWAY_PROJECT_ID in CD workflow if needed.');
