const AddThreadUseCase = require('../AddThreadUseCase');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');

describe('AddThreadUseCase', () => {
  it('should orchestrate add thread correctly', async () => {
    const payload = { title: 'sebuah thread', body: 'sebuah body', owner: 'user-1' };
    const expectedCreatedThread = new CreatedThread({ id: 'thread-1', title: 'sebuah thread', owner: 'user-1' });

    const mockThreadRepository = {
      addThread: jest.fn().mockResolvedValue(expectedCreatedThread),
    };

    const useCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });
    const result = await useCase.execute(payload);

    expect(mockThreadRepository.addThread).toHaveBeenCalled();
    expect(result).toEqual(expectedCreatedThread);
  });
});
