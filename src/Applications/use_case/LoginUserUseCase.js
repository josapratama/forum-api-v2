const NewAuthentication = require('../../Domains/authentications/entities/NewAuthentication');

class LoginUserUseCase {
  constructor({
    userRepository,
    authenticationRepository,
    authenticationTokenManager,
    passwordHash,
  }) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
    this._authenticationTokenManager = authenticationTokenManager;
    this._passwordHash = passwordHash;
  }

  async execute(useCasePayload) {
    const { username, password } = this._verifyPayload(useCasePayload);

    const encryptedPassword = await this._userRepository.getPasswordByUsername(username);
    await this._passwordHash.comparePassword(password, encryptedPassword);

    const id = await this._userRepository.getIdByUsername(username);

    const accessToken = await this._authenticationTokenManager.createAccessToken({ username, id });
    const refreshToken = await this._authenticationTokenManager.createRefreshToken({ username, id });

    const newAuthentication = new NewAuthentication({
      accessToken,
      refreshToken,
    });

    await this._authenticationRepository.addToken(newAuthentication.refreshToken);

    return newAuthentication;
  }

  _verifyPayload({ username, password }) {
    if (!username || !password) {
      throw new Error('USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new Error('USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    return { username, password };
  }
}

module.exports = LoginUserUseCase;
