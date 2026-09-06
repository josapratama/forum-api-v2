import LikeRepository from '../LikeRepository.js';

describe('LikeRepository interface', () => {
  it('should throw error when invoking abstract method toggleLike', async () => {
    const likeRepository = new LikeRepository();
    await expect(likeRepository.toggleLike('comment-1', 'user-1'))
      .rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract method getLikeCountsByCommentIds', async () => {
    const likeRepository = new LikeRepository();
    await expect(likeRepository.getLikeCountsByCommentIds(['comment-1']))
      .rejects.toThrow('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
