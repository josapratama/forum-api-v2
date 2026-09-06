/**
 * Quick API readiness check before Postman submission
 * Run: DATABASE_URL=... node scripts/api-test.mjs
 */

const BASE = 'https://forum-api-production-26d4.up.railway.app';
let pass = 0, fail = 0;

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`${ok ? '✓' : '✗'} ${label}: HTTP ${actual}${!ok ? ` (expected ${expected})` : ''}`);
  if (ok) pass++; else fail++;
  return ok;
}

console.log(`\n=== Forum API V2 Readiness Test ===\nTarget: ${BASE}\n`);

// --- USERS ---
let r = await req('POST', '/users', { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
check('POST /users (valid) → 201', r.status, 201);

r = await req('POST', '/users', { password: 'secret' });
check('POST /users (bad payload) → 400', r.status, 400);

r = await req('POST', '/users', { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
check('POST /users (exist username) → 400', r.status, 400);
if (r.json) console.log(`  message: "${r.json.message}"`);

r = await req('POST', '/users', { username: 'dico ding', password: 'secret', fullname: 'Dicoding' });
check('POST /users (restricted char) → 400', r.status, 400);
if (r.json) console.log(`  message: "${r.json.message}"`);

// --- AUTHENTICATIONS ---
r = await req('POST', '/authentications', { username: 'dicoding', password: 'wrongpass' });
check('POST /auth (invalid password) → 401', r.status, 401);

r = await req('POST', '/authentications', { username: 'notexist', password: 'secret' });
check('POST /auth (invalid username) → 400', r.status, 400);

r = await req('POST', '/authentications', { username: 'dicoding', password: 'secret' });
check('POST /auth (valid) → 201', r.status, 201);
const { accessToken: at, refreshToken: rt } = r.json.data;

r = await req('PUT', '/authentications', { refreshToken: rt });
check('PUT /auth (refresh valid) → 200', r.status, 200);

r = await req('PUT', '/authentications', { refreshToken: 'xxx' });
check('PUT /auth (refresh invalid) → 400', r.status, 400);
if (r.json) console.log(`  message: "${r.json.message}"`);

// --- THREADS ---
r = await req('POST', '/threads');
check('POST /threads (no auth) → 401', r.status, 401);
if (r.json) console.log(`  message: "${r.json.message}"`);

r = await req('POST', '/threads', { body: 'only body' }, at);
check('POST /threads (bad payload) → 400', r.status, 400);

r = await req('POST', '/threads', { title: 'sebuah thread', body: 'sebuah body thread' }, at);
check('POST /threads (valid) → 201', r.status, 201);
const threadId = r.json.data.addedThread.id;
console.log(`  threadId: ${threadId}`);

// --- COMMENTS ---
// Also register johndoe for multi-user tests
await req('POST', '/users', { username: 'johndoe', password: 'secret', fullname: 'John Doe' });
const r_jd = await req('POST', '/authentications', { username: 'johndoe', password: 'secret' });
const at2 = r_jd.json.data.accessToken;

r = await req('POST', `/threads/${threadId}/comments`);
check('POST /comments (no auth) → 401', r.status, 401);
if (r.json) console.log(`  message: "${r.json.message}"`);

r = await req('POST', '/threads/xxx/comments', { content: 'test' }, at);
check('POST /comments (not found thread) → 404', r.status, 404);

r = await req('POST', `/threads/${threadId}/comments`, { content: 'sebuah comment' }, at2);
check('POST /comments (johndoe) → 201', r.status, 201);

r = await req('POST', `/threads/${threadId}/comments`, { content: 'sebuah comment' }, at);
check('POST /comments (dicoding) → 201', r.status, 201);
const commentId = r.json.data.addedComment.id;

r = await req('GET', `/threads/${threadId}`);
check('GET /threads/:id → 200', r.status, 200);
console.log(`  comments count: ${r.json.data.thread.comments.length} (expect 2)`);

r = await req('DELETE', `/threads/${threadId}/comments/xxx`, null, at);
check('DELETE /comments (not found) → 404', r.status, 404);

r = await req('DELETE', `/threads/${threadId}/comments/${commentId}`, null, at2);
check('DELETE /comments (wrong owner) → 403', r.status, 403);

r = await req('DELETE', `/threads/${threadId}/comments/${commentId}`, null, at);
check('DELETE /comments (owner) → 200', r.status, 200);

r = await req('GET', `/threads/${threadId}`);
check('GET /threads (deleted comment) → 200', r.status, 200);
const deletedContent = r.json.data.thread.comments[1]?.content;
console.log(`  deleted comment content: "${deletedContent}" (expect **komentar telah dihapus**)`);

// --- REPLIES ---
// Re-add a comment for replies
r = await req('POST', `/threads/${threadId}/comments`, { content: 'sebuah comment' }, at);
const commentId2 = r.json.data.addedComment.id;

r = await req('POST', `/threads/${threadId}/comments/${commentId2}/replies`);
check('POST /replies (no auth) → 401', r.status, 401);
if (r.json) console.log(`  message: "${r.json.message}"`);

r = await req('POST', `/threads/xxxx/comments/${commentId2}/replies`, { content: 'balasan' }, at2);
check('POST /replies (invalid thread) → 404', r.status, 404);

r = await req('POST', `/threads/${threadId}/comments/xxx/replies`, { content: 'balasan' }, at2);
check('POST /replies (invalid comment) → 404', r.status, 404);

r = await req('POST', `/threads/${threadId}/comments/${commentId2}/replies`, { content: 'sebuah balasan' }, at2);
check('POST /replies (johndoe) → 201', r.status, 201);
const replyId = r.json.data.addedReply.id;

r = await req('POST', `/threads/${threadId}/comments/${commentId2}/replies`, { content: 'sebuah balasan' }, at);
check('POST /replies (dicoding) → 201', r.status, 201);

r = await req('GET', `/threads/${threadId}`);
check('GET /threads (with replies) → 200', r.status, 200);
console.log(`  replies count: ${r.json.data.thread.comments.find(c=>c.id===commentId2)?.replies?.length} (expect 2)`);

r = await req('DELETE', `/threads/${threadId}/comments/${commentId2}/replies/xxx`, null, at);
check('DELETE /replies (not found) → 404', r.status, 404);

r = await req('DELETE', `/threads/${threadId}/comments/${commentId2}/replies/${replyId}`, null, at);
check('DELETE /replies (wrong owner) → 403', r.status, 403);

r = await req('DELETE', `/threads/${threadId}/comments/${commentId2}/replies/${replyId}`, null, at2);
check('DELETE /replies (owner) → 200', r.status, 200);

// --- LIKES ---
r = await req('PUT', `/threads/${threadId}/comments/${commentId2}/likes`);
check('PUT /likes (no auth) → 401', r.status, 401);
if (r.json) console.log(`  message: "${r.json.message}"`);

r = await req('PUT', `/threads/xxxx/comments/${commentId2}/likes`, null, at);
check('PUT /likes (invalid thread) → 404', r.status, 404);

r = await req('PUT', `/threads/${threadId}/comments/xxx/likes`, null, at);
check('PUT /likes (invalid comment) → 404', r.status, 404);

r = await req('PUT', `/threads/${threadId}/comments/${commentId2}/likes`, null, at2);
check('PUT /likes (johndoe likes) → 200', r.status, 200);

r = await req('PUT', `/threads/${threadId}/comments/${commentId2}/likes`, null, at);
check('PUT /likes (dicoding likes) → 200', r.status, 200);

r = await req('GET', `/threads/${threadId}`);
check('GET /threads (likeCount=2) → 200', r.status, 200);
const lc = r.json.data.thread.comments.find(c=>c.id===commentId2)?.likeCount;
console.log(`  likeCount: ${lc} (expect 2) ${lc === 2 ? '✓' : '✗'}`);

r = await req('PUT', `/threads/${threadId}/comments/${commentId2}/likes`, null, at);
check('PUT /likes (dicoding unlike) → 200', r.status, 200);

r = await req('GET', `/threads/${threadId}`);
const lc2 = r.json.data.thread.comments.find(c=>c.id===commentId2)?.likeCount;
console.log(`  likeCount after unlike: ${lc2} (expect 1) ${lc2 === 1 ? '✓' : '✗'}`);

// --- LOGOUT ---
r = await req('DELETE', '/authentications', { refreshToken: rt });
check('DELETE /auth (logout valid) → 200', r.status, 200);

r = await req('DELETE', '/authentications', { refreshToken: 'xxx' });
check('DELETE /auth (logout invalid) → 400', r.status, 400);
if (r.json) console.log(`  message: "${r.json.message}"`);

console.log(`\n${'='.repeat(40)}`);
console.log(`RESULT: ${pass} PASS, ${fail} FAIL`);
console.log(`API: ${BASE}`);
if (fail === 0) console.log('✅ READY FOR SUBMISSION!');
else console.log('⚠️  Fix the failing tests before submitting.');
