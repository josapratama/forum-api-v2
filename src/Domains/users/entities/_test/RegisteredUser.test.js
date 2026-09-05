const RegisteredUser = require('../RegisteredUser');

describe('RegisteredUser entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new RegisteredUser({ id: 'user-1', username: 'dicoding' }))
      .toThrowError('REGISTERED_USER.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new RegisteredUser({ id: 1, username: 'dicoding', fullname: 'Dicoding' }))
      .toThrowError('REGISTERED_USER.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create RegisteredUser correctly', () => {
    const payload = { id: 'user-1', username: 'dicoding', fullname: 'Dicoding Indonesia' };
    const user = new RegisteredUser(payload);
    expect(user.id).toBe(payload.id);
    expect(user.username).toBe(payload.username);
    expect(user.fullname).toBe(payload.fullname);
  });
});
