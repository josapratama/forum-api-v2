class GetCommentLikeCountUseCase {
  constructor({ likeRepository }) {
    this._likeRepository = likeRepository;
  }

  async execute(commentIds) {
    const likeCounts = await this._likeRepository.getLikeCountByCommentIds(commentIds);
    return likeCounts.map(({ commentId, count }) => ({
      commentId,
      count: parseInt(count, 10),
    }));
  }
}

module.exports = GetCommentLikeCountUseCase;
