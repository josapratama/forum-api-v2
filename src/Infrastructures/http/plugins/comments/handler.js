const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
  }

  async postCommentHandler(request, h) {
    const { threadId } = request.params;
    const { id: owner } = request.auth.credentials;
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    const addedComment = await addCommentUseCase.execute({
      ...request.payload,
      threadId,
      owner,
    });

    return h.response({
      status: 'success',
      data: { addedComment },
    }).code(201);
  }

  async deleteCommentHandler(request) {
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

    await deleteCommentUseCase.execute({ threadId, commentId, owner });

    return { status: 'success' };
  }
}

module.exports = CommentsHandler;
