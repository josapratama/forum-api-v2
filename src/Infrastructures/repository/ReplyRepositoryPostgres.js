import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import CreatedReply from '../../Domains/replies/entities/CreatedReply.js';
import ReplyRepository from '../../Domains/replies/ReplyRepository.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(createReply) {
    const { content, commentId, owner } = createReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, NOW(), false) RETURNING id, content, owner',
      values: [id, commentId, owner, content],
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
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('anda tidak berhak menghapus balasan ini');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByCommentIds(commentIds) {
    if (!commentIds.length) {
      return [];
    }

    const query = {
      text: `SELECT r.id, r.comment_id, u.username, r.date, r.content, r.is_deleted
             FROM replies r
             JOIN users u ON r.owner = u.id
             WHERE r.comment_id = ANY($1::text[])
             ORDER BY r.date ASC`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default ReplyRepositoryPostgres;
