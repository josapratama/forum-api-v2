const ToggleLikeUseCase = require('../ToggleLikeUseCase');

describe('ToggleLikeUseCase', () => {
  it('should orchestrate toggle like correctly', async () => {
    const mockLikeRepository = { toggleLike: jest.fn().mockResolvedValue(undefined) };
    const mockCommentRepository = { verifyCommentExists: jest.fn().mockResolvedValue(undefined) };
    const mockThreadRepository = { verifyThreadExists: jest.fn().mockResolvedValue(undefined) };

    const useCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await useCase.execute({ threadId: 'thread-1', commentId: 'comment-1', owner: 'user-1' });

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-1');
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-1');
    expect(mockLikeRepository.toggleLike).toHaveBeenCalledWith('comment-1', 'user-1');
  });
});
