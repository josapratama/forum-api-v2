import CreatedThread from '../CreatedThread.js';

describe('CreatedThread entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreatedThread({ id: 'thread-1', title: 'judul' }))
      .toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new CreatedThread({ title: 'judul', owner: 'user-1' }))
      .toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new CreatedThread({ id: 'thread-1', owner: 'user-1' }))
      .toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    expect(() => new CreatedThread({ id: 123, title: 'judul', owner: 'user-1' }))
      .toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new CreatedThread({ id: 'thread-1', title: true, owner: 'user-1' }))
      .toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new CreatedThread({ id: 'thread-1', title: 'judul', owner: [] }))
      .toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedThread object correctly', () => {
    const payload = { id: 'thread-123', title: 'sebuah thread', owner: 'user-123' };
    const createdThread = new CreatedThread(payload);

    expect(createdThread.id).toEqual(payload.id);
    expect(createdThread.title).toEqual(payload.title);
    expect(createdThread.owner).toEqual(payload.owner);
  });
});
