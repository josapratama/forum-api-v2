const CreatedComment = require('../CreatedComment');

describe('CreatedComment entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new CreatedComment({ id: 'comment-1', content: 'abc' }))
      .toThrowError('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new CreatedComment({ id: 1, content: 'abc', owner: 'user-1' }))
      .toThrowError('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedComment correctly', () => {
    const payload = { id: 'comment-1', content: 'sebuah comment', owner: 'user-1' };
    const comment = new CreatedComment(payload);
    expect(comment.id).toBe(payload.id);
    expect(comment.content).toBe(payload.content);
    expect(comment.owner).toBe(payload.owner);
  });
});
