const AddUserUseCase = require('../AddUserUseCase');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');

describe('AddUserUseCase', () => {
  it('should orchestrate add user correctly', async () => {
    const useCasePayload = { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' };
    const expectedRegisteredUser = new RegisteredUser({ id: 'user-1', username: 'dicoding', fullname: 'Dicoding Indonesia' });

    const mockUserRepository = {
      verifyAvailableUsername: jest.fn().mockResolvedValue(undefined),
      addUser: jest.fn().mockResolvedValue(expectedRegisteredUser),
    };
    const mockPasswordHash = {
      hash: jest.fn().mockResolvedValue('hashed_password'),
    };

    const useCase = new AddUserUseCase({
      userRepository: mockUserRepository,
      passwordHash: mockPasswordHash,
    });

    const result = await useCase.execute(useCasePayload);

    expect(mockUserRepository.verifyAvailableUsername).toHaveBeenCalledWith('dicoding');
    expect(mockPasswordHash.hash).toHaveBeenCalledWith('secret');
    expect(mockUserRepository.addUser).toHaveBeenCalled();
    expect(result).toEqual(expectedRegisteredUser);
  });
});
