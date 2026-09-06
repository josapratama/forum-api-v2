import CommentRepository from '../CommentRepository.js';

describe('CommentRepository interface', () => {
  it('should throw error when invoking abstract method addComment', async () => {
    const repo = new CommentRepository();
    await expect(repo.addComment({})).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract method verifyCommentExists', async () => {
    const repo = new CommentRepository();
    await expect(repo.verifyCommentExists('comment-1')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract method verifyCommentOwner', async () => {
    const repo = new CommentRepository();
    await expect(repo.verifyCommentOwner('comment-1', 'user-1')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract method deleteComment', async () => {
    const repo = new CommentRepository();
    await expect(repo.deleteComment('comment-1')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract method getCommentsByThreadId', async () => {
    const repo = new CommentRepository();
    await expect(repo.getCommentsByThreadId('thread-1')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
