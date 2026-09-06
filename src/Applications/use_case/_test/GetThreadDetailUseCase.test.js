import GetThreadDetailUseCase from "../GetThreadDetailUseCase.js";

describe("GetThreadDetailUseCase", () => {
  it("should return thread detail with comments, replies, and likeCount correctly", async () => {
    // Arrange
    const threadId = "thread-123";

    const mockThread = {
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "dicoding",
    };

    const mockComments = [
      {
        id: "comment-1",
        username: "johndoe",
        date: "2021-08-08T07:22:33.555Z",
        content: "sebuah komentar",
        is_deleted: false,
      },
      {
        id: "comment-2",
        username: "dicoding",
        date: "2021-08-08T07:26:21.338Z",
        content: "komentar yang akan dihapus",
        is_deleted: true,
      },
    ];

    const mockReplies = [
      {
        id: "reply-1",
        comment_id: "comment-1",
        username: "johndoe",
        date: "2021-08-08T07:59:48.766Z",
        content: "balasan yang akan dihapus",
        is_deleted: true,
      },
      {
        id: "reply-2",
        comment_id: "comment-1",
        username: "dicoding",
        date: "2021-08-08T08:07:01.522Z",
        content: "sebuah balasan",
        is_deleted: false,
      },
    ];

    const mockLikeCounts = [{ comment_id: "comment-1", count: 2 }];

    const mockThreadRepository = {
      getThreadById: vi.fn(() => Promise.resolve(mockThread)),
    };
    const mockCommentRepository = {
      getCommentsByThreadId: vi.fn(() => Promise.resolve(mockComments)),
    };
    const mockReplyRepository = {
      getRepliesByCommentIds: vi.fn(() => Promise.resolve(mockReplies)),
    };
    const mockLikeRepository = {
      getLikeCountsByCommentIds: vi.fn(() => Promise.resolve(mockLikeCounts)),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toEqual({
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "dicoding",
      comments: [
        {
          id: "comment-1",
          username: "johndoe",
          date: "2021-08-08T07:22:33.555Z",
          content: "sebuah komentar",
          likeCount: 2,
          replies: [
            {
              id: "reply-1",
              content: "**balasan telah dihapus**",
              date: "2021-08-08T07:59:48.766Z",
              username: "johndoe",
            },
            {
              id: "reply-2",
              content: "sebuah balasan",
              date: "2021-08-08T08:07:01.522Z",
              username: "dicoding",
            },
          ],
        },
        {
          id: "comment-2",
          username: "dicoding",
          date: "2021-08-08T07:26:21.338Z",
          content: "**komentar telah dihapus**",
          likeCount: 0,
          replies: [],
        },
      ],
    });

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      threadId,
    );
    expect(mockReplyRepository.getRepliesByCommentIds).toHaveBeenCalledWith([
      "comment-1",
      "comment-2",
    ]);
    expect(mockLikeRepository.getLikeCountsByCommentIds).toHaveBeenCalledWith([
      "comment-1",
      "comment-2",
    ]);
  });

  it("should return thread detail with empty comments when no comments exist", async () => {
    const threadId = "thread-123";

    const mockThread = {
      id: threadId,
      title: "sebuah thread",
      body: "isi thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "dicoding",
    };

    const mockThreadRepository = {
      getThreadById: vi.fn(() => Promise.resolve(mockThread)),
    };
    const mockCommentRepository = {
      getCommentsByThreadId: vi.fn(() => Promise.resolve([])),
    };
    const mockReplyRepository = {
      getRepliesByCommentIds: vi.fn(() => Promise.resolve([])),
    };
    const mockLikeRepository = {
      getLikeCountsByCommentIds: vi.fn(() => Promise.resolve([])),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    expect(threadDetail.comments).toEqual([]);
    expect(mockLikeRepository.getLikeCountsByCommentIds).toHaveBeenCalledWith(
      [],
    );
  });
});
