import pool from '../../database/postgres/pool.js';
import LikeRepositoryPostgres from '../LikeRepositoryPostgres.js';
import LikesTableTestHelper from '../../../../tests/LikesTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';

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
    it('should add like when user has not liked yet', async () => {
      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');

      await likeRepository.toggleLike('comment-123', 'user-123');

      const likes = await LikesTableTestHelper.findLikeByCommentAndOwner('comment-123', 'user-123');
      expect(likes).toHaveLength(1);
    });

    it('should remove like when user has already liked', async () => {
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const likeRepository = new LikeRepositoryPostgres(pool, () => '456');

      await likeRepository.toggleLike('comment-123', 'user-123');

      const likes = await LikesTableTestHelper.findLikeByCommentAndOwner('comment-123', 'user-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('getLikeCountsByCommentIds', () => {
    it('should return empty array when commentIds is empty', async () => {
      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');

      const result = await likeRepository.getLikeCountsByCommentIds([]);

      expect(result).toEqual([]);
    });

    it('should return correct like counts for given comment ids', async () => {
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');

      const result = await likeRepository.getLikeCountsByCommentIds(['comment-123', 'comment-not-exist']);

      expect(result).toHaveLength(1);
      expect(result[0].comment_id).toEqual('comment-123');
      expect(result[0].count).toEqual(1);
    });

    it('should return 0 count for comments with no likes', async () => {
      const likeRepository = new LikeRepositoryPostgres(pool, () => '123');

      const result = await likeRepository.getLikeCountsByCommentIds(['comment-123']);

      expect(result).toEqual([]);
    });
  });
});
