import AddThreadUseCase from "../AddThreadUseCase.js";

describe("AddThreadUseCase", () => {
  it("should orchestrate the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "sebuah thread",
      body: "sebuah body thread",
      owner: "user-123",
    };

    // mock return value BEDA dari expected (netral)
    const mockCreatedThread = {
      id: "thread-999",
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    };

    const expectedCreatedThread = {
      id: "thread-999",
      title: "sebuah thread",
      owner: "user-123",
    };

    const mockThreadRepository = {
      addThread: vi.fn(() => Promise.resolve(mockCreatedThread)),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(createdThread).toStrictEqual(expectedCreatedThread);
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      expect.objectContaining({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      }),
    );
  });
});
