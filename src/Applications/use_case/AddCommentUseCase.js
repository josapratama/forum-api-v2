import CreateComment from '../../Domains/comments/entities/CreateComment.js';

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const createComment = new CreateComment(useCasePayload);
    await this._threadRepository.verifyThreadExists(createComment.threadId);
    return this._commentRepository.addComment(createComment);
  }
}

export default AddCommentUseCase;
