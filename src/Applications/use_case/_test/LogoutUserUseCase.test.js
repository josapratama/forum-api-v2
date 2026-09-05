const LogoutUserUseCase = require('../LogoutUserUseCase');

describe('LogoutUserUseCase', () => {
  it('should throw error when payload missing refresh token', async () => {
    const useCase = new LogoutUserUseCase({ authenticationRepository: {} });
    await expect(useCase.execute({})).rejects.toThrowError('DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
  });

  it('should throw error when payload wrong type', async () => {
    const useCase = new LogoutUserUseCase({ authenticationRepository: {} });
    await expect(useCase.execute({ refreshToken: 123 }))
      .rejects.toThrowError('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_TYPE_SPECIFICATION');
  });

  it('should delete token correctly', async () => {
    const mockAuthRepository = {
      checkAvailabilityToken: jest.fn().mockResolvedValue(undefined),
      deleteToken: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new LogoutUserUseCase({ authenticationRepository: mockAuthRepository });
    await useCase.execute({ refreshToken: 'refreshToken' });
    expect(mockAuthRepository.checkAvailabilityToken).toHaveBeenCalledWith('refreshToken');
    expect(mockAuthRepository.deleteToken).toHaveBeenCalledWith('refreshToken');
  });
});
