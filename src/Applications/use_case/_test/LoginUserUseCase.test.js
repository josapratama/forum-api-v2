const LoginUserUseCase = require('../LoginUserUseCase');

describe('LoginUserUseCase', () => {
  it('should throw error when payload missing property', async () => {
    const useCase = new LoginUserUseCase({
      userRepository: {},
      authenticationRepository: {},
      authenticationTokenManager: {},
      passwordHash: {},
    });
    await expect(useCase.execute({ username: 'dicoding' }))
      .rejects.toThrowError('USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong type', async () => {
    const useCase = new LoginUserUseCase({
      userRepository: {},
      authenticationRepository: {},
      authenticationTokenManager: {},
      passwordHash: {},
    });
    await expect(useCase.execute({ username: 123, password: 'abc' }))
      .rejects.toThrowError('USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrate login correctly', async () => {
    const payload = { username: 'dicoding', password: 'secret' };

    const mockUserRepository = {
      getPasswordByUsername: jest.fn().mockResolvedValue('hashed_secret'),
      getIdByUsername: jest.fn().mockResolvedValue('user-1'),
    };
    const mockPasswordHash = {
      comparePassword: jest.fn().mockResolvedValue(undefined),
    };
    const mockTokenManager = {
      createAccessToken: jest.fn().mockResolvedValue('accessToken'),
      createRefreshToken: jest.fn().mockResolvedValue('refreshToken'),
    };
    const mockAuthRepository = {
      addToken: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthRepository,
      authenticationTokenManager: mockTokenManager,
      passwordHash: mockPasswordHash,
    });

    const result = await useCase.execute(payload);

    expect(mockUserRepository.getPasswordByUsername).toHaveBeenCalledWith('dicoding');
    expect(mockPasswordHash.comparePassword).toHaveBeenCalledWith('secret', 'hashed_secret');
    expect(mockUserRepository.getIdByUsername).toHaveBeenCalledWith('dicoding');
    expect(mockTokenManager.createAccessToken).toHaveBeenCalled();
    expect(mockTokenManager.createRefreshToken).toHaveBeenCalled();
    expect(mockAuthRepository.addToken).toHaveBeenCalledWith('refreshToken');
    expect(result.accessToken).toBe('accessToken');
    expect(result.refreshToken).toBe('refreshToken');
  });
});
