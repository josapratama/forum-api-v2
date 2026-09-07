const TOKEN = '1689137e-ad63-4609-a490-b911958af7aa';
const SVC = '41a0afe9-e43f-41fb-878b-c89c2854d444';
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

// Get latest deployment
const d1 = await gql(
  'query($s:String!,$e:String!){deployments(input:{serviceId:$s,environmentId:$e}){edges{node{id status createdAt}}}}',
  { s: SVC, e: ENV }
);
const deploy = d1.data.deployments.edges[0].node;
console.log('Latest deploy:', deploy.status, deploy.createdAt, deploy.id);

// Get logs
const d2 = await gql(
  'query($d:String!){deploymentLogs(deploymentId:$d){message}}',
  { d: deploy.id }
);
console.log('\n=== RUNTIME LOGS (last 30) ===');
d2.data.deploymentLogs.slice(-30).forEach(l => console.log(l.message));
