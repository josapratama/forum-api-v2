import DeleteReplyUseCase from '../DeleteReplyUseCase.js';

describe('DeleteReplyUseCase', () => {
  it('should orchestrate the delete reply action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockReplyRepository = {
      verifyReplyExists: vi.fn(() => Promise.resolve()),
      verifyReplyOwner: vi.fn(() => Promise.resolve()),
      deleteReply: vi.fn(() => Promise.resolve()),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn(() => Promise.resolve()),
    };
    const mockThreadRepository = {
      verifyThreadExists: vi.fn(() => Promise.resolve()),
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteReplyUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.verifyReplyExists).toHaveBeenCalledWith(useCasePayload.replyId);
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(useCasePayload.replyId, useCasePayload.owner);
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith(useCasePayload.replyId);
  });
});
