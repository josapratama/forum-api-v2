const CreatedReply = require('../CreatedReply');

describe('CreatedReply entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new CreatedReply({ id: 'reply-1', content: 'abc' }))
      .toThrowError('CREATED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload wrong data type', () => {
    expect(() => new CreatedReply({ id: 1, content: 'abc', owner: 'user-1' }))
      .toThrowError('CREATED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedReply correctly', () => {
    const payload = { id: 'reply-1', content: 'sebuah reply', owner: 'user-1' };
    const reply = new CreatedReply(payload);
    expect(reply.id).toBe(payload.id);
    expect(reply.content).toBe(payload.content);
    expect(reply.owner).toBe(payload.owner);
  });
});
