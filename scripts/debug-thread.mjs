const BASE = 'https://forum-api-production-26d4.up.railway.app';

// Register debug user
await fetch(`${BASE}/users`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'debuguser', password: 'secret', fullname: 'Debug User' }),
});

// Login
const lr = await fetch(`${BASE}/authentications`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'debuguser', password: 'secret' }),
});
const ld = await lr.json();
console.log('Login status:', lr.status);
const at = ld.data?.accessToken;
console.log('Token:', at ? at.substring(0, 30) + '...' : 'MISSING');

// Create thread
const tr = await fetch(`${BASE}/threads`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${at}`,
  },
  body: JSON.stringify({ title: 'sebuah thread', body: 'sebuah body thread' }),
});
const td = await tr.json();
console.log('Thread status:', tr.status);
console.log('Thread body:', JSON.stringify(td, null, 2));
