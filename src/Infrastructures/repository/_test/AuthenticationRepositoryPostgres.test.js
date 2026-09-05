const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('AuthenticationRepositoryPostgres', () => {
  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addToken', () => {
    it('should add token correctly', async () => {
      const repo = new AuthenticationRepositoryPostgres(pool);
      await repo.addToken('mytoken');
      const tokens = await AuthenticationsTableTestHelper.findToken('mytoken');
      expect(tokens).toHaveLength(1);
    });
  });

  describe('checkAvailabilityToken', () => {
    it('should throw InvariantError when token not found', async () => {
      const repo = new AuthenticationRepositoryPostgres(pool);
      await expect(repo.checkAvailabilityToken('notexist')).rejects.toThrow(InvariantError);
    });

    it('should not throw when token exists', async () => {
      await AuthenticationsTableTestHelper.addToken('mytoken');
      const repo = new AuthenticationRepositoryPostgres(pool);
      await expect(repo.checkAvailabilityToken('mytoken')).resolves.not.toThrow();
    });
  });

  describe('deleteToken', () => {
    it('should delete token correctly', async () => {
      await AuthenticationsTableTestHelper.addToken('mytoken');
      const repo = new AuthenticationRepositoryPostgres(pool);
      await repo.deleteToken('mytoken');
      const tokens = await AuthenticationsTableTestHelper.findToken('mytoken');
      expect(tokens).toHaveLength(0);
    });
  });
});
