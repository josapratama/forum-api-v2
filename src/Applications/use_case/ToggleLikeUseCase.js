class ToggleLikeUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ threadId, commentId, owner }) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);
    await this._likeRepository.toggleLike(commentId, owner);
  }
}

module.exports = ToggleLikeUseCase;
