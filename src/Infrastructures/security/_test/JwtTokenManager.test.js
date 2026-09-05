const Jwt = require('@hapi/jwt');
const JwtTokenManager = require('../JwtTokenManager');
const AuthenticationError = require('../../../Commons/exceptions/AuthenticationError');

describe('JwtTokenManager', () => {
  describe('createAccessToken', () => {
    it('should create access token correctly', async () => {
      process.env.ACCESS_TOKEN_KEY = 'access_token_secret';
      const tokenManager = new JwtTokenManager(Jwt);
      const token = await tokenManager.createAccessToken({ id: 'user-1', username: 'dicoding' });
      expect(typeof token).toBe('string');
    });
  });

  describe('createRefreshToken', () => {
    it('should create refresh token correctly', async () => {
      process.env.REFRESH_TOKEN_KEY = 'refresh_token_secret';
      const tokenManager = new JwtTokenManager(Jwt);
      const token = await tokenManager.createRefreshToken({ id: 'user-1', username: 'dicoding' });
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should throw AuthenticationError when token invalid', async () => {
      process.env.REFRESH_TOKEN_KEY = 'refresh_token_secret';
      const tokenManager = new JwtTokenManager(Jwt);
      await expect(tokenManager.verifyRefreshToken('invalidtoken')).rejects.toThrow(AuthenticationError);
    });

    it('should not throw when token valid', async () => {
      process.env.REFRESH_TOKEN_KEY = 'refresh_token_secret';
      const tokenManager = new JwtTokenManager(Jwt);
      const token = await tokenManager.createRefreshToken({ id: 'user-1', username: 'dicoding' });
      await expect(tokenManager.verifyRefreshToken(token)).resolves.not.toThrow();
    });
  });

  describe('decodePayload', () => {
    it('should decode payload correctly', async () => {
      process.env.REFRESH_TOKEN_KEY = 'refresh_token_secret';
      const tokenManager = new JwtTokenManager(Jwt);
      const token = await tokenManager.createRefreshToken({ id: 'user-1', username: 'dicoding' });
      const payload = await tokenManager.decodePayload(token);
      expect(payload.id).toBe('user-1');
      expect(payload.username).toBe('dicoding');
    });
  });
});
