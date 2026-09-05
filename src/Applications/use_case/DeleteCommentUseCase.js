class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute({ commentId, owner }) {
    await this._commentRepository.verifyCommentExists(commentId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
