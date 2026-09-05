const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment', () => {
    it('should persist and return CreatedComment correctly', async () => {
      const createComment = new CreateComment({ content: 'sebuah comment', threadId: 'thread-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');

      const result = await repo.addComment(createComment);

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(result).toBeInstanceOf(CreatedComment);
      expect(result.id).toBe('comment-123');
    });
  });

  describe('verifyCommentExists', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentExists('comment-notexist')).rejects.toThrow(NotFoundError);
    });

    it('should not throw when comment exists', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentExists('comment-123')).resolves.not.toThrow();
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw AuthorizationError when owner mismatch', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentOwner('comment-123', 'user-other')).rejects.toThrow(AuthorizationError);
    });

    it('should not throw when owner matches', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should soft delete comment correctly', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      await repo.deleteComment('comment-123');
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_deleted).toBe(true);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return comments with correct content for deleted ones', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123', isDeleted: false });
      await CommentsTableTestHelper.addComment({ id: 'comment-124', isDeleted: true, content: 'deleted' });
      const repo = new CommentRepositoryPostgres(pool, () => '123');
      const comments = await repo.getCommentsByThreadId('thread-123');
      expect(comments).toHaveLength(2);
      const deleted = comments.find((c) => c.id === 'comment-124');
      expect(deleted.content).toBe('**komentar telah dihapus**');
    });
  });
});
