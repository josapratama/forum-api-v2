const TOKEN = '1689137e-ad63-4609-a490-b911958af7aa';
const SVC = '41a0afe9-e43f-41fb-878b-c89c2854d444';
const ENV = 'f3ce8037-b6ed-4a45-be22-040b85c81706';

const r = await fetch('https://backboard.railway.app/graphql/v2', {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'mutation($s:String!,$e:String!){ serviceInstanceRedeploy(serviceId:$s,environmentId:$e) }',
    variables: { s: SVC, e: ENV },
  }),
});
const d = await r.json();
console.log('Redeploy:', JSON.stringify(d));
