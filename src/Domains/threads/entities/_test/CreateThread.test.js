import CreateThread from '../CreateThread.js';

describe('CreateThread entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreateThread({ title: 'judul', body: 'isi' }))
      .toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new CreateThread({ title: 'judul', owner: 'user-1' }))
      .toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new CreateThread({ body: 'isi', owner: 'user-1' }))
      .toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    expect(() => new CreateThread({ title: 123, body: 'isi', owner: 'user-1' }))
      .toThrowError('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new CreateThread({ title: 'judul', body: true, owner: 'user-1' }))
      .toThrowError('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new CreateThread({ title: 'judul', body: 'isi', owner: 123 }))
      .toThrowError('CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateThread object correctly', () => {
    const payload = { title: 'sebuah thread', body: 'sebuah body', owner: 'user-123' };
    const createThread = new CreateThread(payload);

    expect(createThread.title).toEqual(payload.title);
    expect(createThread.body).toEqual(payload.body);
    expect(createThread.owner).toEqual(payload.owner);
  });
});
