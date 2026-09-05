const RefreshAuthenticationUseCase = require('../RefreshAuthenticationUseCase');

describe('RefreshAuthenticationUseCase', () => {
  it('should throw error when missing refresh token', async () => {
    const useCase = new RefreshAuthenticationUseCase({
      authenticationRepository: {},
      authenticationTokenManager: {},
    });
    await expect(useCase.execute({}))
      .rejects.toThrowError('REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
  });

  it('should throw error when wrong type', async () => {
    const useCase = new RefreshAuthenticationUseCase({
      authenticationRepository: {},
      authenticationTokenManager: {},
    });
    await expect(useCase.execute({ refreshToken: 123 }))
      .rejects.toThrowError('REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_TYPE_SPECIFICATION');
  });

  it('should refresh access token correctly', async () => {
    const mockTokenManager = {
      verifyRefreshToken: jest.fn().mockResolvedValue(undefined),
      decodePayload: jest.fn().mockResolvedValue({ username: 'dicoding', id: 'user-1' }),
      createAccessToken: jest.fn().mockResolvedValue('newAccessToken'),
    };
    const mockAuthRepository = {
      checkAvailabilityToken: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthRepository,
      authenticationTokenManager: mockTokenManager,
    });

    const result = await useCase.execute({ refreshToken: 'refreshToken' });

    expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledWith('refreshToken');
    expect(mockAuthRepository.checkAvailabilityToken).toHaveBeenCalledWith('refreshToken');
    expect(mockTokenManager.decodePayload).toHaveBeenCalledWith('refreshToken');
    expect(mockTokenManager.createAccessToken).toHaveBeenCalled();
    expect(result).toBe('newAccessToken');
  });
});
