const CreateReply = require('../CreateReply');

describe('CreateReply entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new CreateReply({ content: 'abc', commentId: 'comment-1' }))
      .toThrowError('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new CreateReply({
      content: 123, commentId: 'comment-1', threadId: 'thread-1', owner: 'user-1',
    })).toThrowError('CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateReply correctly', () => {
    const payload = {
      content: 'sebuah reply', commentId: 'comment-1', threadId: 'thread-1', owner: 'user-1',
    };
    const reply = new CreateReply(payload);
    expect(reply.content).toBe(payload.content);
    expect(reply.commentId).toBe(payload.commentId);
    expect(reply.threadId).toBe(payload.threadId);
    expect(reply.owner).toBe(payload.owner);
  });
});
