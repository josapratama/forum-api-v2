class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute({ replyId, owner }) {
    await this._replyRepository.verifyReplyExists(replyId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);
    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
