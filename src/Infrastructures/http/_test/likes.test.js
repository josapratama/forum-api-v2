import request from 'supertest';
import createServer from '../createServer.js';
import container from '../../container.js';
import pool from '../../database/postgres/pool.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';

// Helper: register + login
const registerAndLogin = async (app, username = 'likeuser') => {
  await request(app).post('/users').send({ username, password: 'secret123', fullname: 'Like User' });
  const loginRes = await request(app).post('/authentications').send({ username, password: 'secret123' });
  return loginRes.body.data.accessToken;
};

describe('Likes API', () => {
  let app;

  beforeAll(async () => {
    app = await createServer(container);
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('PUT /threads/:threadId/comments/:commentId/likes', () => {
    it('should respond 200 and like a comment', async () => {
      const accessToken = await registerAndLogin(app, 'likeuser1');

      // Create thread and comment
      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Test Thread', body: 'Test body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Test comment' });
      const { id: commentId } = commentRes.body.data.addedComment;

      // Like
      const res = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should respond 200 and unlike (toggle) a comment', async () => {
      const accessToken = await registerAndLogin(app, 'likeuser2');

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Toggle Thread', body: 'Body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Comment' });
      const { id: commentId } = commentRes.body.data.addedComment;

      // Like first time
      await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Unlike (toggle)
      const res = await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should respond 401 when no access token', async () => {
      const res = await request(app)
        .put('/threads/thread-123/comments/comment-123/likes');

      expect(res.statusCode).toBe(401);
    });

    it('should respond 404 when thread not found', async () => {
      const accessToken = await registerAndLogin(app, 'likeuser3');

      const res = await request(app)
        .put('/threads/thread-notexist/comments/comment-123/likes')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
    });

    it('should show likeCount in thread detail', async () => {
      const accessToken = await registerAndLogin(app, 'likeuser4');

      const threadRes = await request(app)
        .post('/threads')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'LikeCount Thread', body: 'Body' });
      const { id: threadId } = threadRes.body.data.addedThread;

      const commentRes = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'A comment' });
      const { id: commentId } = commentRes.body.data.addedComment;

      await request(app)
        .put(`/threads/${threadId}/comments/${commentId}/likes`)
        .set('Authorization', `Bearer ${accessToken}`);

      const detailRes = await request(app).get(`/threads/${threadId}`);

      expect(detailRes.statusCode).toBe(200);
      expect(detailRes.body.data.thread.comments[0].likeCount).toBe(1);
    });
  });
});
