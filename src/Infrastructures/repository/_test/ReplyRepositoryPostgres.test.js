const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CreateReply = require('../../../Domains/replies/entities/CreateReply');
const CreatedReply = require('../../../Domains/replies/entities/CreatedReply');

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
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

  describe('addReply', () => {
    it('should persist and return CreatedReply correctly', async () => {
      const createReply = new CreateReply({
        content: 'sebuah reply', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123',
      });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      const result = await repo.addReply(createReply);

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
      expect(result).toBeInstanceOf(CreatedReply);
      expect(result.id).toBe('reply-123');
    });
  });

  describe('verifyReplyExists', () => {
    it('should throw NotFoundError when reply not found', async () => {
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyExists('reply-notexist')).rejects.toThrow(NotFoundError);
    });

    it('should not throw when reply exists', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyExists('reply-123')).resolves.not.toThrow();
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw AuthorizationError when owner mismatch', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyOwner('reply-123', 'user-other')).rejects.toThrow(AuthorizationError);
    });

    it('should not throw when owner matches', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', owner: 'user-123' });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('deleteReply', () => {
    it('should soft delete reply correctly', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123' });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      await repo.deleteReply('reply-123');
      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_deleted).toBe(true);
    });
  });

  describe('getRepliesByCommentIds', () => {
    it('should return empty array when no comment ids', async () => {
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      const result = await repo.getRepliesByCommentIds([]);
      expect(result).toHaveLength(0);
    });

    it('should return replies with deleted content replaced', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', isDeleted: false });
      await RepliesTableTestHelper.addReply({ id: 'reply-124', isDeleted: true });
      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      const replies = await repo.getRepliesByCommentIds(['comment-123']);
      expect(replies).toHaveLength(2);
      const deleted = replies.find((r) => r.id === 'reply-124');
      expect(deleted.content).toBe('**balasan telah dihapus**');
    });
  });
});
