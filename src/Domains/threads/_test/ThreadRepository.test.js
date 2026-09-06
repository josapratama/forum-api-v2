import ThreadRepository from '../ThreadRepository.js';

describe('ThreadRepository interface', () => {
  it('should throw error when invoking abstract method addThread', async () => {
    const threadRepository = new ThreadRepository();
    await expect(threadRepository.addThread({})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract method verifyThreadExists', async () => {
    const threadRepository = new ThreadRepository();
    await expect(threadRepository.verifyThreadExists('thread-1')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoking abstract method getThreadById', async () => {
    const threadRepository = new ThreadRepository();
    await expect(threadRepository.getThreadById('thread-1')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
