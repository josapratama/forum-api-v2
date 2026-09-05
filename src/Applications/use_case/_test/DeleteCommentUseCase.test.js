const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrate delete comment correctly', async () => {
    const mockCommentRepository = {
      verifyCommentExists: jest.fn().mockResolvedValue(undefined),
      verifyCommentOwner: jest.fn().mockResolvedValue(undefined),
      deleteComment: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new DeleteCommentUseCase({ commentRepository: mockCommentRepository });
    await useCase.execute({ commentId: 'comment-1', owner: 'user-1' });

    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-1');
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith('comment-1', 'user-1');
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith('comment-1');
  });
});
