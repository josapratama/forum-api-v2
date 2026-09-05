const ToggleLikeUseCase = require('../../../../Applications/use_case/ToggleLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
  }

  async putLikeHandler(request) {
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const toggleLikeUseCase = this._container.getInstance(ToggleLikeUseCase.name);

    await toggleLikeUseCase.execute({ threadId, commentId, owner });

    return { status: 'success' };
  }
}

module.exports = LikesHandler;
