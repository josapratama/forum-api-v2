const RegisterUser = require('../RegisterUser');

describe('RegisterUser entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new RegisterUser({ username: 'abc', password: 'abc' }))
      .toThrowError('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new RegisterUser({ username: 123, password: 'abc', fullname: 'abc' }))
      .toThrowError('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when username more than 50 characters', () => {
    expect(() => new RegisterUser({ username: 'a'.repeat(51), password: 'abc', fullname: 'abc' }))
      .toThrowError('REGISTER_USER.USERNAME_LIMIT_CHAR');
  });

  it('should throw error when username contains restricted characters', () => {
    expect(() => new RegisterUser({ username: 'dic oding', password: 'abc', fullname: 'abc' }))
      .toThrowError('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER');
  });

  it('should create RegisterUser object correctly', () => {
    const payload = { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' };
    const user = new RegisterUser(payload);
    expect(user.username).toBe(payload.username);
    expect(user.password).toBe(payload.password);
    expect(user.fullname).toBe(payload.fullname);
  });
});
