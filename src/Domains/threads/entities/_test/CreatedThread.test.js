const CreatedThread = require('../CreatedThread');

describe('CreatedThread entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new CreatedThread({ id: 'thread-1', title: 'abc' }))
      .toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new CreatedThread({ id: 1, title: 'abc', owner: 'user-1' }))
      .toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedThread correctly', () => {
    const payload = { id: 'thread-1', title: 'sebuah thread', owner: 'user-1' };
    const thread = new CreatedThread(payload);
    expect(thread.id).toBe(payload.id);
    expect(thread.title).toBe(payload.title);
    expect(thread.owner).toBe(payload.owner);
  });
});
