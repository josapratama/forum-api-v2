const CreateReply = require('../../Domains/replies/entities/CreateReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const createReply = new CreateReply(useCasePayload);
    await this._threadRepository.verifyThreadExists(createReply.threadId);
    await this._commentRepository.verifyCommentExists(createReply.commentId);
    return this._replyRepository.addReply(createReply);
  }
}

module.exports = AddReplyUseCase;
