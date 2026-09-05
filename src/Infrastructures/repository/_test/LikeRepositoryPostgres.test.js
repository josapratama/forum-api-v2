const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
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

  describe('toggleLike', () => {
    it('should add like when not exists', async () => {
      const repo = new LikeRepositoryPostgres(pool, () => '123');
      await repo.toggleLike('comment-123', 'user-123');
      const likes = await LikesTableTestHelper.findLikeByCommentIdAndOwner('comment-123', 'user-123');
      expect(likes).toHaveLength(1);
    });

    it('should remove like when already liked', async () => {
      await LikesTableTestHelper.addLike({ commentId: 'comment-123', owner: 'user-123' });
      const repo = new LikeRepositoryPostgres(pool, () => '456');
      await repo.toggleLike('comment-123', 'user-123');
      const likes = await LikesTableTestHelper.findLikeByCommentIdAndOwner('comment-123', 'user-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('getLikeCountByCommentIds', () => {
    it('should return empty when no comment ids', async () => {
      const repo = new LikeRepositoryPostgres(pool, () => '123');
      const result = await repo.getLikeCountByCommentIds([]);
      expect(result).toHaveLength(0);
    });

    it('should return like counts correctly', async () => {
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const repo = new LikeRepositoryPostgres(pool, () => '123');
      const result = await repo.getLikeCountByCommentIds(['comment-123']);
      expect(result).toHaveLength(1);
      expect(result[0].commentId).toBe('comment-123');
      expect(parseInt(result[0].count, 10)).toBe(1);
    });
  });
});
