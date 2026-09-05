const GetCommentLikeCountUseCase = require('../GetCommentLikeCountUseCase');

describe('GetCommentLikeCountUseCase', () => {
  it('should return like count for a comment', async () => {
    const mockLikeRepository = {
      getLikeCountByCommentIds: jest.fn().mockResolvedValue([
        { commentId: 'comment-1', count: '5' },
      ]),
    };

    const useCase = new GetCommentLikeCountUseCase({
      likeRepository: mockLikeRepository,
    });

    const result = await useCase.execute(['comment-1']);

    expect(mockLikeRepository.getLikeCountByCommentIds).toHaveBeenCalledWith(['comment-1']);
    expect(result).toHaveLength(1);
    expect(result[0].commentId).toBe('comment-1');
    expect(result[0].count).toBe(5);
  });

  it('should return empty array when no comments', async () => {
    const mockLikeRepository = {
      getLikeCountByCommentIds: jest.fn().mockResolvedValue([]),
    };

    const useCase = new GetCommentLikeCountUseCase({
      likeRepository: mockLikeRepository,
    });

    const result = await useCase.execute([]);

    expect(result).toEqual([]);
  });
});
