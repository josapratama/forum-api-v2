const TOKEN = '1689137e-ad63-4609-a490-b911958af7aa';
const PRJ = 'c565ecb1-3a02-4ab1-8505-5624c42c3f07';
const ENV = 'f3ce8037-b6ed-4a45-be22-040b85c81706';
const API = 'https://backboard.railway.app/graphql/v2';

const gql = async (q, v = {}) => {
  const r = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q, variables: v }),
  });
  return r.json();
};

// Create new bare service
const create = await gql(
  'mutation($i:ServiceCreateInput!){serviceCreate(input:$i){id name}}',
  { i: { projectId: PRJ, name: 'forum-api' } }
);
console.log('New service:', JSON.stringify(create.data));
const newId = create.data?.serviceCreate?.id;

if (!newId) { console.error('Failed:', JSON.stringify(create)); process.exit(1); }

// Set env vars
const envVars = {
  NODE_ENV: 'production',
  HOST: '0.0.0.0',
  PORT: '5000',
  DATABASE_URL: 'postgresql://neondb_owner:npg_n4gvUVosZC9q@ep-sparkling-frog-azt7f0kj-pooler.c-3.ap-southeast-1.aws.neon.tech/forumapi',
  ACCESS_TOKEN_KEY: 'Jx8KpQm2nRvL5wYdH7tAeZ1sUbCgFoNiMcPkVjXqW3hT6yBuD4rOlEaSfIz0',
  REFRESH_TOKEN_KEY: 'mP9nBqR2xK7vL4wYdH1tAeZ5sUbCgFoNiMcJkVjXqW3hT8yBuD6rOlEaSfIz0',
  ACCCESS_TOKEN_AGE: '3000',
  REDIS_URL: 'redis://redis.railway.internal:6379',
};

for (const [name, value] of Object.entries(envVars)) {
  const r = await gql('mutation($i:VariableUpsertInput!){variableUpsert(input:$i)}', {
    i: { projectId: PRJ, environmentId: ENV, serviceId: newId, name, value }
  });
  console.log(`Set ${name}:`, r.data?.variableUpsert ? '✓' : '✗');
}

// Create domain
const dom = await gql(
  'mutation($i:ServiceDomainCreateInput!){serviceDomainCreate(input:$i){id domain}}',
  { i: { serviceId: newId, environmentId: ENV } }
);
console.log('Domain:', dom.data?.serviceDomainCreate?.domain);

console.log('\n✅ New service ID:', newId);
console.log('Now run: railway up --service forum-api to deploy');
