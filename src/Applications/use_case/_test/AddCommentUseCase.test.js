const AddCommentUseCase = require('../AddCommentUseCase');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');

describe('AddCommentUseCase', () => {
  it('should orchestrate add comment correctly', async () => {
    const payload = { content: 'sebuah comment', threadId: 'thread-1', owner: 'user-1' };
    const expectedCreatedComment = new CreatedComment({ id: 'comment-1', content: 'sebuah comment', owner: 'user-1' });

    const mockCommentRepository = { addComment: jest.fn().mockResolvedValue(expectedCreatedComment) };
    const mockThreadRepository = { verifyThreadExists: jest.fn().mockResolvedValue(undefined) };

    const useCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await useCase.execute(payload);

    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-1');
    expect(mockCommentRepository.addComment).toHaveBeenCalled();
    expect(result).toEqual(expectedCreatedComment);
  });
});
