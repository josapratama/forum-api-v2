import pool from '../../database/postgres/pool.js';
import ThreadRepositoryPostgres from '../ThreadRepositoryPostgres.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import CreatedThread from '../../../Domains/threads/entities/CreatedThread.js';

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
    it('should persist thread and return CreatedThread correctly', async () => {
      const createThread = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: 'user-123',
      };
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const createdThread = await threadRepositoryPostgres.addThread(createThread);

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
      expect(createdThread).toBeInstanceOf(CreatedThread);
      expect(createdThread.id).toEqual('thread-123');
      expect(createdThread.title).toEqual(createThread.title);
      expect(createdThread.owner).toEqual(createThread.owner);
    });
  });

  describe('verifyThreadExists', () => {
    it('should not throw error when thread exists', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

      await expect(threadRepositoryPostgres.verifyThreadExists('thread-123')).resolves.not.toThrow();
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

      await expect(threadRepositoryPostgres.verifyThreadExists('thread-notexist'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('getThreadById', () => {
    it('should return thread correctly', async () => {
      const date = new Date('2021-08-08T07:19:09.775Z');
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body',
        owner: 'user-123',
        date,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('sebuah thread');
      expect(thread.body).toEqual('sebuah body');
      expect(thread.username).toEqual('dicoding');
      expect(thread.date).toBeDefined();
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

      await expect(threadRepositoryPostgres.getThreadById('thread-notexist'))
        .rejects.toThrow(NotFoundError);
    });
  });
});
