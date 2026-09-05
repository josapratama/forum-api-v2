const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
  }

  async postReplyHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);

    const addedReply = await addReplyUseCase.execute({
      ...request.payload,
      commentId,
      threadId,
      owner,
    });

    return h.response({
      status: 'success',
      data: { addedReply },
    }).code(201);
  }

  async deleteReplyHandler(request) {
    const { threadId, commentId, replyId } = request.params;
    const { id: owner } = request.auth.credentials;
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);

    await deleteReplyUseCase.execute({
      threadId, commentId, replyId, owner,
    });

    return { status: 'success' };
  }
}

module.exports = RepliesHandler;
