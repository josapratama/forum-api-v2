import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import CreatedReply from '../../../Domains/replies/entities/CreatedReply.js';

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
    it('should persist reply and return CreatedReply correctly', async () => {
      const createReply = {
        content: 'sebuah balasan',
        commentId: 'comment-123',
        owner: 'user-123',
      };
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const createdReply = await replyRepositoryPostgres.addReply(createReply);

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies).toHaveLength(1);
      expect(createdReply).toBeInstanceOf(CreatedReply);
      expect(createdReply.id).toEqual('reply-123');
      expect(createdReply.content).toEqual(createReply.content);
      expect(createdReply.owner).toEqual(createReply.owner);
    });
  });

  describe('verifyReplyExists', () => {
    it('should not throw error when reply exists', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');

      await expect(replyRepositoryPostgres.verifyReplyExists('reply-123')).resolves.not.toThrow();
    });

    it('should throw NotFoundError when reply does not exist', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');

      await expect(replyRepositoryPostgres.verifyReplyExists('reply-notexist'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyReplyOwner', () => {
    it('should not throw error when user is the owner', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrow();
    });

    it('should throw AuthorizationError when user is not the owner', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-other'))
        .rejects.toThrow(AuthorizationError);
    });

    it('should throw NotFoundError when reply does not exist', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-notexist', 'user-123'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteReply', () => {
    it('should soft-delete reply by setting is_deleted to true', async () => {
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');

      await replyRepositoryPostgres.deleteReply('reply-123');

      const replies = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(replies[0].is_deleted).toBe(true);
    });
  });

  describe('getRepliesByCommentIds', () => {
    it('should return replies with username correctly', async () => {
      const date = new Date('2021-08-08T07:59:48.766Z');
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'sebuah balasan',
        date,
        isDeleted: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(['comment-123']);

      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[0].comment_id).toEqual('comment-123');
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[0].content).toEqual('sebuah balasan');
      expect(replies[0].is_deleted).toBe(false);
    });

    it('should return empty array when commentIds is empty', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds([]);

      expect(replies).toHaveLength(0);
    });

    it('should return empty array when no replies match', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(['comment-notexist']);

      expect(replies).toHaveLength(0);
    });
  });
});
