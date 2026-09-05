const CreateComment = require('../CreateComment');

describe('CreateComment entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new CreateComment({ content: 'abc', threadId: 'thread-1' }))
      .toThrowError('CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new CreateComment({ content: 123, threadId: 'thread-1', owner: 'user-1' }))
      .toThrowError('CREATE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateComment correctly', () => {
    const payload = { content: 'sebuah comment', threadId: 'thread-1', owner: 'user-1' };
    const comment = new CreateComment(payload);
    expect(comment.content).toBe(payload.content);
    expect(comment.threadId).toBe(payload.threadId);
    expect(comment.owner).toBe(payload.owner);
  });
});
