import request from 'supertest';
import pool from '../../database/postgres/pool.js';
import container from '../../container.js';
import createServer from '../createServer.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';

// Helper: register a user and log in, return accessToken
const registerAndLogin = async (app, { username = 'dicoding', password = 'secret', fullname = 'Dicoding Indonesia' } = {}) => {
  await request(app).post('/users').send({ username, password, fullname });
  const loginRes = await request(app).post('/authentications').send({ username, password });
  return loginRes.body.data.accessToken;
};

describe('Threads API', () => {
  let app;

  beforeAll(async () => {
    app = await createServer(container);
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  // ─── POST /threads ────────────────────────────────────────────────────────────

  describe('POST /threads', () => {
    it('should respond 201 and return addedThread', async () => {
      const accessToken = await registerAndLogin(app);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedThread).toBeDefined();
      expect(response.body.data.addedThread.id).toBeDefined();
      expect(response.body.data.addedThread.title).toEqual('sebuah thread');
      expect(response.body.data.addedThread.owner).toBeDefined();
    });

    it('should respond 400 when payload missing required property', async () => {
      const accessToken = await registerAndLogin(app);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread' });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });

    it('should respond 400 when payload has wrong data type', async () => {
      const accessToken = await registerAndLogin(app);

      const response = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 123, body: 'body' });

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });

    it('should respond 401 when no access token provided', async () => {
      const response = await request(app)
        .post('/threads')
        .send({ title: 'sebuah thread', body: 'body' });

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });
  });

  // ─── GET /threads/:threadId ───────────────────────────────────────────────────

  describe('GET /threads/:threadId', () => {
    it('should respond 200 and return thread detail with comments and replies', async () => {
      const accessToken = await registerAndLogin(app);

      // create thread
      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });
      const { id: threadId } = threadRes.body.data.addedThread;

      // add comment
      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });
      const { id: commentId } = commentRes.body.data.addedComment;

      // add reply
      await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      const response = await request(app).get(`/threads/${threadId}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      const { thread } = response.body.data;
      expect(thread.id).toEqual(threadId);
      expect(thread.title).toEqual('sebuah thread');
      expect(thread.body).toEqual('sebuah body thread');
      expect(thread.username).toBeDefined();
      expect(Array.isArray(thread.comments)).toBe(true);
      expect(thread.comments).toHaveLength(1);
      expect(thread.comments[0].id).toEqual(commentId);
      expect(Array.isArray(thread.comments[0].replies)).toBe(true);
      expect(thread.comments[0].replies).toHaveLength(1);
    });

    it('should respond 404 when thread does not exist', async () => {
      const response = await request(app).get('/threads/thread-notexist');

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should display **komentar telah dihapus** for deleted comments', async () => {
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar yang akan dihapus' });
      const { id: commentId } = commentRes.body.data.addedComment;

      await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      const response = await request(app).get(`/threads/${threadId}`);

      expect(response.status).toEqual(200);
      expect(response.body.data.thread.comments[0].content).toEqual('**komentar telah dihapus**');
    });
  });

  // ─── POST /threads/:threadId/comments ─────────────────────────────────────────

  describe('POST /threads/:threadId/comments', () => {
    it('should respond 201 and return addedComment', async () => {
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah komentar' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedComment).toBeDefined();
      expect(response.body.data.addedComment.id).toBeDefined();
      expect(response.body.data.addedComment.content).toEqual('sebuah komentar');
      expect(response.body.data.addedComment.owner).toBeDefined();
    });

    it('should respond 400 when payload missing content', async () => {
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'sebuah thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });

    it('should respond 401 when no access token provided', async () => {
      const response = await request(app)
        .post('/threads/thread-123/comments')
        .send({ content: 'komentar' });

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });

    it('should respond 404 when thread does not exist', async () => {
      const accessToken = await registerAndLogin(app);

      const response = await request(app)
        .post('/threads/thread-notexist/comments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });
  });

  // ─── DELETE /threads/:threadId/comments/:commentId ────────────────────────────

  describe('DELETE /threads/:threadId/comments/:commentId', () => {
    it('should respond 200 and soft-delete the comment', async () => {
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should respond 403 when user is not the comment owner', async () => {
      const accessToken = await registerAndLogin(app);
      const otherToken = await registerAndLogin(app, { username: 'johndoe', password: 'secret', fullname: 'John Doe' });

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar milik dicoding' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
    });

    it('should respond 404 when comment does not exist', async () => {
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/comment-notexist`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should respond 401 when no access token provided', async () => {
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123');

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });
  });

  // ─── POST /threads/:threadId/comments/:commentId/replies ──────────────────────

  describe('POST /threads/:threadId/comments/:commentId/replies', () => {
    it('should respond 201 and return addedReply', async () => {
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'sebuah balasan' });

      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      expect(response.body.data.addedReply).toBeDefined();
      expect(response.body.data.addedReply.id).toBeDefined();
      expect(response.body.data.addedReply.content).toEqual('sebuah balasan');
      expect(response.body.data.addedReply.owner).toBeDefined();
    });

    it('should respond 400 when payload missing content', async () => {
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
    });

    it('should respond 401 when no access token provided', async () => {
      const response = await request(app)
        .post('/threads/thread-123/comments/comment-123/replies')
        .send({ content: 'balasan' });

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });

    it('should respond 404 when thread does not exist', async () => {
      const accessToken = await registerAndLogin(app);

      const response = await request(app)
        .post('/threads/thread-notexist/comments/comment-notexist/replies')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'balasan' });

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should respond 404 when comment does not exist', async () => {
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const response = await request(app)
        .post(`/threads/${threadId}/comments/comment-notexist/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'balasan' });

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });
  });

  // ─── DELETE /threads/:threadId/comments/:commentId/replies/:replyId ──────────

  describe('DELETE /threads/:threadId/comments/:commentId/replies/:replyId', () => {
    it('should respond 200 and soft-delete the reply', async () => {
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const replyRes = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'balasan' });
      const { id: replyId } = replyRes.body.data.addedReply;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
    });

    it('should respond 403 when user is not the reply owner', async () => {
      const accessToken = await registerAndLogin(app);
      const otherToken = await registerAndLogin(app, { username: 'johndoe', password: 'secret', fullname: 'John Doe' });

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const replyRes = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'balasan milik dicoding' });
      const { id: replyId } = replyRes.body.data.addedReply;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
    });

    it('should respond 404 when reply does not exist', async () => {
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/reply-notexist`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should respond 401 when no access token provided', async () => {
      const response = await request(app)
        .delete('/threads/thread-123/comments/comment-123/replies/reply-123');

      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
    });

    it('should display **balasan telah dihapus** in thread detail after reply deleted', async () => {
      const accessToken = await registerAndLogin(app);

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'thread', body: 'body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'komentar' });
      const { id: commentId } = commentRes.body.data.addedComment;

      const replyRes = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'balasan yang akan dihapus' });
      const { id: replyId } = replyRes.body.data.addedReply;

      await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      const detailRes = await request(app).get(`/threads/${threadId}`);
      expect(detailRes.body.data.thread.comments[0].replies[0].content).toEqual('**balasan telah dihapus**');
    });
  });
});
