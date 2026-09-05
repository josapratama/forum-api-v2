const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const ServiceContainer = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('Threads endpoint', () => {
  let server;
  let accessToken;
  let userId;

  beforeAll(async () => {
    const container = new ServiceContainer();
    server = await createServer(container);

    // Register user
    const registerResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'threadtestuser',
        password: 'secret',
        fullname: 'Thread Test User',
      },
    });
    const registerJson = JSON.parse(registerResponse.payload);
    userId = registerJson.data.addedUser.id;

    // Login
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: { username: 'threadtestuser', password: 'secret' },
    });
    const loginJson = JSON.parse(loginResponse.payload);
    accessToken = loginJson.data.accessToken;
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('POST /threads', () => {
    it('should response 201 and return created thread', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'sebuah thread', body: 'sebuah body thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(201);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toBe('sebuah thread');
    });

    it('should response 401 when no auth', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'sebuah thread', body: 'sebuah body thread' },
      });
      expect(response.statusCode).toBe(401);
    });

    it('should response 400 when payload invalid', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'sebuah thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(400);
      expect(responseJson.status).toBe('fail');
    });
  });

  describe('GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail', async () => {
      // Create thread first
      const createResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'detail thread', body: 'body detail thread' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const createJson = JSON.parse(createResponse.payload);
      const threadId = createJson.data.addedThread.id;

      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toBe(200);
      expect(responseJson.status).toBe('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toBe(threadId);
      expect(responseJson.data.thread.comments).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-notexist',
      });
      expect(response.statusCode).toBe(404);
    });
  });
});
