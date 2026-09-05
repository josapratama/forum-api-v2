class GetThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = comments.map((c) => c.id);
    const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);
    const likeCounts = await this._likeRepository.getLikeCountByCommentIds(commentIds);

    const likeMap = {};
    likeCounts.forEach(({ commentId, count }) => {
      likeMap[commentId] = parseInt(count, 10);
    });

    const commentsWithRepliesAndLikes = comments.map((comment) => ({
      ...comment,
      likeCount: likeMap[comment.id] || 0,
      replies: replies
        .filter((r) => r.commentId === comment.id)
        .map(({ commentId: _cid, ...rest }) => rest),
    }));

    return {
      ...thread,
      comments: commentsWithRepliesAndLikes,
    };
  }
}

module.exports = GetThreadDetailUseCase;
