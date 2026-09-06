import ReplyRepository from '../ReplyRepository.js';

describe('ReplyRepository interface', () => {
  it('should throw error when invoking abstract method addReply', async () => {
    const repo = new ReplyRepository();
    await expect(repo.addReply({})).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract method verifyReplyExists', async () => {
    const repo = new ReplyRepository();
    await expect(repo.verifyReplyExists('reply-1')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract method verifyReplyOwner', async () => {
    const repo = new ReplyRepository();
    await expect(repo.verifyReplyOwner('reply-1', 'user-1')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract method deleteReply', async () => {
    const repo = new ReplyRepository();
    await expect(repo.deleteReply('reply-1')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract method getRepliesByCommentIds', async () => {
    const repo = new ReplyRepository();
    await expect(repo.getRepliesByCommentIds(['comment-1'])).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
