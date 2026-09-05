const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread', () => {
    it('should persist and return CreatedThread correctly', async () => {
      const createThread = new CreateThread({ title: 'sebuah thread', body: 'sebuah body', owner: 'user-123' });
      const repo = new ThreadRepositoryPostgres(pool, () => '123');

      const result = await repo.addThread(createThread);

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
      expect(result).toBeInstanceOf(CreatedThread);
      expect(result.id).toBe('thread-123');
    });
  });

  describe('verifyThreadExists', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyThreadExists('thread-notexist')).rejects.toThrow(NotFoundError);
    });

    it('should not throw when thread exists', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyThreadExists('thread-123')).resolves.not.toThrow();
    });
  });

  describe('getThreadById', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      await expect(repo.getThreadById('thread-notexist')).rejects.toThrow(NotFoundError);
    });

    it('should return thread with username when found', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123', title: 'sebuah thread' });
      const repo = new ThreadRepositoryPostgres(pool, () => '123');
      const thread = await repo.getThreadById('thread-123');
      expect(thread.id).toBe('thread-123');
      expect(thread.title).toBe('sebuah thread');
      expect(thread.username).toBe('dicoding');
    });
  });
});
