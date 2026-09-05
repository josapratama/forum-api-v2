const AddReplyUseCase = require('../AddReplyUseCase');
const CreatedReply = require('../../../Domains/replies/entities/CreatedReply');

describe('AddReplyUseCase', () => {
  it('should orchestrate add reply correctly', async () => {
    const payload = {
      content: 'sebuah reply', commentId: 'comment-1', threadId: 'thread-1', owner: 'user-1',
    };
    const expectedCreatedReply = new CreatedReply({ id: 'reply-1', content: 'sebuah reply', owner: 'user-1' });

    const mockReplyRepository = { addReply: jest.fn().mockResolvedValue(expectedCreatedReply) };
    const mockCommentRepository = { verifyCommentExists: jest.fn().mockResolvedValue(undefined) };
    const mockThreadRepository = { verifyThreadExists: jest.fn().mockResolvedValue(undefined) };

    const useCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await useCase.execute(payload);

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-1');
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-1');
    expect(mockReplyRepository.addReply).toHaveBeenCalled();
    expect(result).toEqual(expectedCreatedReply);
  });
});
