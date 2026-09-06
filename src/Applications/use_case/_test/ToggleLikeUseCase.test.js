import ToggleLikeUseCase from '../ToggleLikeUseCase.js';

describe('ToggleLikeUseCase', () => {
  it('should orchestrate toggle like correctly', async () => {
    // Arrange
    const mockLikeRepository = {
      toggleLike: vi.fn().mockResolvedValue(undefined),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn().mockResolvedValue(undefined),
    };
    const mockThreadRepository = {
      verifyThreadExists: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new ToggleLikeUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await useCase.execute({
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    });

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-123');
    expect(mockLikeRepository.toggleLike).toHaveBeenCalledWith('comment-123', 'user-123');
  });
});
