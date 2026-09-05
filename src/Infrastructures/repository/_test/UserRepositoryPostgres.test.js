const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthenticationError = require('../../../Commons/exceptions/AuthenticationError');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');

describe('UserRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyAvailableUsername', () => {
    it('should throw InvariantError when username not available', async () => {
      await UsersTableTestHelper.addUser({ username: 'dicoding' });
      const repo = new UserRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyAvailableUsername('dicoding')).rejects.toThrow(InvariantError);
    });

    it('should not throw error when username available', async () => {
      const repo = new UserRepositoryPostgres(pool, () => '123');
      await expect(repo.verifyAvailableUsername('dicoding')).resolves.not.toThrow();
    });
  });

  describe('addUser', () => {
    it('should persist user and return RegisteredUser correctly', async () => {
      const registerUser = new RegisterUser({ username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
      const repo = new UserRepositoryPostgres(pool, () => '123');

      const registeredUser = await repo.addUser(registerUser);

      const users = await UsersTableTestHelper.findUsersById('user-123');
      expect(users).toHaveLength(1);
      expect(registeredUser).toBeInstanceOf(RegisteredUser);
      expect(registeredUser.id).toBe('user-123');
    });
  });

  describe('getPasswordByUsername', () => {
    it('should throw AuthenticationError when user not found', async () => {
      const repo = new UserRepositoryPostgres(pool, () => '123');
      await expect(repo.getPasswordByUsername('notexist')).rejects.toThrow(AuthenticationError);
    });

    it('should return password when user found', async () => {
      await UsersTableTestHelper.addUser({ username: 'dicoding', password: 'hashed_password' });
      const repo = new UserRepositoryPostgres(pool, () => '123');
      const password = await repo.getPasswordByUsername('dicoding');
      expect(password).toBe('hashed_password');
    });
  });

  describe('getIdByUsername', () => {
    it('should throw NotFoundError when user not found', async () => {
      const repo = new UserRepositoryPostgres(pool, () => '123');
      await expect(repo.getIdByUsername('notexist')).rejects.toThrow(NotFoundError);
    });

    it('should return id when user found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      const repo = new UserRepositoryPostgres(pool, () => '123');
      const id = await repo.getIdByUsername('dicoding');
      expect(id).toBe('user-123');
    });
  });
});
