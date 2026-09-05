const AuthenticationError = require('../../Commons/exceptions/AuthenticationError');

class JwtTokenManager {
  constructor(jwt) {
    this._jwt = jwt;
  }

  async createAccessToken(payload) {
    return this._jwt.token.generate(
      payload,
      process.env.ACCESS_TOKEN_KEY,
    );
  }

  async createRefreshToken(payload) {
    return this._jwt.token.generate(
      payload,
      process.env.REFRESH_TOKEN_KEY,
    );
  }

  async verifyRefreshToken(token) {
    try {
      const artifacts = this._jwt.token.decode(token);
      this._jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
    } catch {
      throw new AuthenticationError('refresh token tidak valid');
    }
  }

  async decodePayload(token) {
    const artifacts = this._jwt.token.decode(token);
    return artifacts.decoded.payload;
  }
}

module.exports = JwtTokenManager;
