const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate delete reply correctly', async () => {
    const mockReplyRepository = {
      verifyReplyExists: jest.fn().mockResolvedValue(undefined),
      verifyReplyOwner: jest.fn().mockResolvedValue(undefined),
      deleteReply: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new DeleteReplyUseCase({ replyRepository: mockReplyRepository });
    await useCase.execute({ replyId: 'reply-1', owner: 'user-1' });

    expect(mockReplyRepository.verifyReplyExists).toHaveBeenCalledWith('reply-1');
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith('reply-1', 'user-1');
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith('reply-1');
  });
});
