import CreatedComment from '../CreatedComment.js';

describe('CreatedComment entity', () => {
  it('should throw error when payload does not contain needed property', () => {
    expect(() => new CreatedComment({ id: 'comment-1', content: 'isi' }))
      .toThrowError('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new CreatedComment({ content: 'isi', owner: 'user-1' }))
      .toThrowError('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new CreatedComment({ id: 'comment-1', owner: 'user-1' }))
      .toThrowError('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    expect(() => new CreatedComment({ id: 123, content: 'isi', owner: 'user-1' }))
      .toThrowError('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new CreatedComment({ id: 'comment-1', content: true, owner: 'user-1' }))
      .toThrowError('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    expect(() => new CreatedComment({ id: 'comment-1', content: 'isi', owner: [] }))
      .toThrowError('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedComment object correctly', () => {
    const payload = { id: 'comment-123', content: 'sebuah komentar', owner: 'user-123' };
    const createdComment = new CreatedComment(payload);

    expect(createdComment.id).toEqual(payload.id);
    expect(createdComment.content).toEqual(payload.content);
    expect(createdComment.owner).toEqual(payload.owner);
  });
});
