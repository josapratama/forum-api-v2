import AddReplyUseCase from "../AddReplyUseCase.js";

describe("AddReplyUseCase", () => {
  it("should orchestrate the add reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "sebuah balasan",
      commentId: "comment-123",
      threadId: "thread-123",
      owner: "user-123",
    };

    // mock return value BEDA dari expected (netral)
    const mockCreatedReply = {
      id: "reply-999",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    const expectedCreatedReply = {
      id: "reply-999",
      content: "sebuah balasan",
      owner: "user-123",
    };

    const mockReplyRepository = {
      addReply: vi.fn(() => Promise.resolve(mockCreatedReply)),
    };
    const mockCommentRepository = {
      verifyCommentExists: vi.fn(() => Promise.resolve()),
    };
    const mockThreadRepository = {
      verifyThreadExists: vi.fn(() => Promise.resolve()),
    };

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(createdReply).toStrictEqual(expectedCreatedReply);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: useCasePayload.content,
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      }),
    );
  });
});
