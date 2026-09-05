const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should get thread detail with comments, replies, and like counts', async () => {
    const threadId = 'thread-1';
    const mockThread = {
      id: 'thread-1', title: 'sebuah thread', body: 'sebuah body', date: '2021-08-13T05:17:12.994Z', username: 'dicoding',
    };
    const mockComments = [
      {
        id: 'comment-1', username: 'dicoding', date: '2021-08-13', content: 'sebuah comment',
      },
    ];
    const mockReplies = [
      {
        id: 'reply-1', commentId: 'comment-1', username: 'johndoe', date: '2021-08-13', content: 'sebuah reply',
      },
    ];
    const mockLikeCounts = [{ commentId: 'comment-1', count: '2' }];

    const mockThreadRepo = { getThreadById: jest.fn().mockResolvedValue(mockThread) };
    const mockCommentRepo = { getCommentsByThreadId: jest.fn().mockResolvedValue(mockComments) };
    const mockReplyRepo = { getRepliesByCommentIds: jest.fn().mockResolvedValue(mockReplies) };
    const mockLikeRepo = { getLikeCountByCommentIds: jest.fn().mockResolvedValue(mockLikeCounts) };

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo,
      replyRepository: mockReplyRepo,
      likeRepository: mockLikeRepo,
    });

    const result = await useCase.execute(threadId);

    expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockReplyRepo.getRepliesByCommentIds).toHaveBeenCalledWith(['comment-1']);
    expect(mockLikeRepo.getLikeCountByCommentIds).toHaveBeenCalledWith(['comment-1']);
    expect(result.comments[0].likeCount).toBe(2);
    expect(result.comments[0].replies[0].id).toBe('reply-1');
    expect(result.comments[0].replies[0].commentId).toBeUndefined();
  });

  it('should return 0 likeCount when no likes', async () => {
    const mockThread = { id: 'thread-1', title: 't', body: 'b', date: 'd', username: 'u' };
    const mockComments = [{ id: 'comment-1', username: 'u', date: 'd', content: 'c' }];

    const mockThreadRepo = { getThreadById: jest.fn().mockResolvedValue(mockThread) };
    const mockCommentRepo = { getCommentsByThreadId: jest.fn().mockResolvedValue(mockComments) };
    const mockReplyRepo = { getRepliesByCommentIds: jest.fn().mockResolvedValue([]) };
    const mockLikeRepo = { getLikeCountByCommentIds: jest.fn().mockResolvedValue([]) };

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo,
      replyRepository: mockReplyRepo,
      likeRepository: mockLikeRepo,
    });

    const result = await useCase.execute('thread-1');
    expect(result.comments[0].likeCount).toBe(0);
    expect(result.comments[0].replies).toHaveLength(0);
  });
});
