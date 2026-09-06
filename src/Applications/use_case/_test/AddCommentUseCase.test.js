import AddCommentUseCase from "../AddCommentUseCase.js";

describe("AddCommentUseCase", () => {
  it("should orchestrate the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "sebuah komentar",
      threadId: "thread-123",
      owner: "user-123",
    };

    // mock return value BEDA dari expected (netral)
    const mockCreatedComment = {
      id: "comment-999",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    const expectedCreatedComment = {
      id: "comment-999",
      content: "sebuah komentar",
      owner: "user-123",
    };

    const mockCommentRepository = {
      addComment: vi.fn(() => Promise.resolve(mockCreatedComment)),
    };
    const mockThreadRepository = {
      verifyThreadExists: vi.fn(() => Promise.resolve()),
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(createdComment).toStrictEqual(expectedCreatedComment);
    expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      expect.objectContaining({
        content: useCasePayload.content,
        threadId: useCasePayload.threadId,
        owner: useCasePayload.owner,
      }),
    );
  });
});
