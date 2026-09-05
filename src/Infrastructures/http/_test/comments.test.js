const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const ServiceContainer = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('Comments endpoint', () => {
  let server;
  let accessToken;
  let threadId;

  beforeAll(async () => {
    const container = new ServiceContainer();
    server = await createServer(container);

    // Register & login
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: { username: 'commenttestuser', password: 'secret', fullname: 'Comment Test User' },
    });
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: { username: 'commenttestuser', password: 'secret' },
    });
    accessToken = JSON.parse(loginResponse.payload).data.accessToken;

    // Create thread
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 'test thread', body: 'test body' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    threadId = JSON.parse(threadResponse.payload).data.addedThread.id;
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('POST /threads/{threadId}/comments', () => {
    it('should response 201 and return created comment', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'sebuah comment' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.addedComment.id).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-notexist/comments',
        payload: { content: 'sebuah comment' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      expect(response.statusCode).toBe(404);
    });

    it('should response 401 when no auth', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'sebuah comment' },
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and return success', async () => {
      const addResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'comment to delete' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const commentId = JSON.parse(addResponse.payload).data.addedComment.id;

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toBe('success');
    });

    it('should response 403 when not comment owner', async () => {
      // Add second user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'user2comment', password: 'secret', fullname: 'User Two' },
      });
      const login2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'user2comment', password: 'secret' },
      });
      const access2 = JSON.parse(login2.payload).data.accessToken;

      // Create comment with user1
      const addResp = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: { content: 'comment owner test' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const cId = JSON.parse(addResp.payload).data.addedComment.id;

      // Try delete with user2
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${cId}`,
        headers: { Authorization: `Bearer ${access2}` },
      });
      expect(response.statusCode).toBe(403);
    });
  });
});
