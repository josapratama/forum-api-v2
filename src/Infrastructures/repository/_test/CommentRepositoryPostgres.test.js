import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import CreatedComment from '../../../Domains/comments/entities/CreatedComment.js';

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
    it('should persist comment and return CreatedComment correctly', async () => {
      const createComment = {
        content: 'sebuah komentar',
        threadId: 'thread-123',
        owner: 'user-123',
      };
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const createdComment = await commentRepositoryPostgres.addComment(createComment);

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(createdComment).toBeInstanceOf(CreatedComment);
      expect(createdComment.id).toEqual('comment-123');
      expect(createdComment.content).toEqual(createComment.content);
      expect(createdComment.owner).toEqual(createComment.owner);
    });
  });

  describe('verifyCommentExists', () => {
    it('should not throw error when comment exists', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');

      await expect(commentRepositoryPostgres.verifyCommentExists('comment-123')).resolves.not.toThrow();
    });

    it('should throw NotFoundError when comment does not exist', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');

      await expect(commentRepositoryPostgres.verifyCommentExists('comment-notexist'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner', () => {
    it('should not throw error when user is the owner', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow();
    });

    it('should throw AuthorizationError when user is not the owner', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-other'))
        .rejects.toThrow(AuthorizationError);
    });

    it('should throw NotFoundError when comment does not exist', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-notexist', 'user-123'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteComment', () => {
    it('should soft-delete comment by setting is_deleted to true', async () => {
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');

      await commentRepositoryPostgres.deleteComment('comment-123');

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments[0].is_deleted).toBe(true);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return comments with username correctly', async () => {
      const date = new Date('2021-08-08T07:22:33.555Z');
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'sebuah komentar',
        date,
        isDeleted: false,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].content).toEqual('sebuah komentar');
      expect(comments[0].is_deleted).toBe(false);
    });

    it('should return empty array when no comments exist', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => '123');
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      expect(comments).toHaveLength(0);
    });
  });
});
