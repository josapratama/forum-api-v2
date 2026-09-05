const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CreatedReply = require('../../Domains/replies/entities/CreatedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(createReply) {
    const {
      content, commentId, threadId, owner,
    } = createReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDeleted = false;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, commentId, threadId, owner, content, date, isDeleted],
    };

    const result = await this._pool.query(query);
    return new CreatedReply({ ...result.rows[0] });
  }

  async verifyReplyExists(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);
    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = TRUE WHERE id = $1',
      values: [replyId],
    };
    await this._pool.query(query);
  }

  async getRepliesByCommentIds(commentIds) {
    if (!commentIds.length) return [];

    const query = {
      text: `SELECT replies.id, replies.comment_id AS "commentId", users.username, replies.date,
             CASE WHEN replies.is_deleted THEN '**balasan telah dihapus**' ELSE replies.content END AS content
             FROM replies
             LEFT JOIN users ON replies.owner = users.id
             WHERE replies.comment_id = ANY($1::text[])
             ORDER BY replies.date ASC`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
