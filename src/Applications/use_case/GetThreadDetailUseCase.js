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
    const comments =
      await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = comments.map((c) => c.id);
    const [replies, likeCounts] = await Promise.all([
      this._replyRepository.getRepliesByCommentIds(commentIds),
      this._likeRepository.getLikeCountsByCommentIds(commentIds),
    ]);

    // Build map: commentId → likeCount
    const likeCountMap = {};
    likeCounts.forEach(({ comment_id, count }) => {
      likeCountMap[comment_id] = count;
    });

    const commentsWithReplies = comments.map((comment) => ({
      ...comment,
      content: comment.is_deleted
        ? "**komentar telah dihapus**"
        : comment.content,
      likeCount: likeCountMap[comment.id] || 0,
      replies: replies
        .filter((reply) => reply.comment_id === comment.id)
        .map((reply) => ({
          id: reply.id,
          content: reply.is_deleted
            ? "**balasan telah dihapus**"
            : reply.content,
          date: reply.date,
          username: reply.username,
        })),
    }));

    // Strip is_deleted from comment objects before returning
    // eslint-disable-next-line no-unused-vars
    const cleanComments = commentsWithReplies.map(
      ({ is_deleted, ...rest }) => rest,
    );

    return { ...thread, comments: cleanComments };
  }
}

export default GetThreadDetailUseCase;
