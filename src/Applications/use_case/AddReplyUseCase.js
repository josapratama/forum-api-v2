import CreateReply from "../../Domains/replies/entities/CreateReply.js";

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, ...rest } = useCasePayload;
    const createReply = new CreateReply(rest);
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(createReply.commentId);
    return this._replyRepository.addReply(createReply);
  }
}

export default AddReplyUseCase;
