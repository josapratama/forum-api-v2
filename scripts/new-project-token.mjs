const TOKEN = '1689137e-ad63-4609-a490-b911958af7aa';
const PRJ = 'c565ecb1-3a02-4ab1-8505-5624c42c3f07';
const ENV = 'f3ce8037-b6ed-4a45-be22-040b85c81706';

const r = await fetch('https://backboard.railway.app/graphql/v2', {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'mutation($n:String!,$p:String!,$e:String!){ projectTokenCreate(input:{name:$n,projectId:$p,environmentId:$e}) }',
    variables: { n: 'github-actions-v2', p: PRJ, e: ENV },
  }),
});
const d = await r.json();
console.log('New project token:', d.data?.projectTokenCreate);
if (!d.data?.projectTokenCreate) console.log('Error:', JSON.stringify(d));
