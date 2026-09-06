import CreateReply from '../CreateReply.js';

describe('CreateReply entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreateReply({ content: 'isi', commentId: 'comment-1' }))
      .toThrowError('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new CreateReply({ content: 'isi', owner: 'user-1' }))
      .toThrowError('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new CreateReply({ commentId: 'comment-1', owner: 'user-1' }))
      .toThrowError('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    expect(() => new CreateReply({ content: 123, commentId: 'comment-1', owner: 'user-1' }))
      .toThrowError('CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new CreateReply({ content: 'isi', commentId: true, owner: 'user-1' }))
      .toThrowError('CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new CreateReply({ content: 'isi', commentId: 'comment-1', owner: [] }))
      .toThrowError('CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateReply object correctly', () => {
    const payload = { content: 'sebuah balasan', commentId: 'comment-123', owner: 'user-123' };
    const createReply = new CreateReply(payload);

    expect(createReply.content).toEqual(payload.content);
    expect(createReply.commentId).toEqual(payload.commentId);
    expect(createReply.owner).toEqual(payload.owner);
  });
});
