const CreateThread = require('../CreateThread');

describe('CreateThread entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new CreateThread({ title: 'abc', body: 'abc' }))
      .toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new CreateThread({ title: 123, body: 'abc', owner: 'user-1' }))
      .toThrowError('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateThread correctly', () => {
    const payload = { title: 'sebuah thread', body: 'sebuah body', owner: 'user-1' };
    const thread = new CreateThread(payload);
    expect(thread.title).toBe(payload.title);
    expect(thread.body).toBe(payload.body);
    expect(thread.owner).toBe(payload.owner);
  });
});
