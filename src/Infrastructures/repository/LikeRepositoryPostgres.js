const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async toggleLike(commentId, owner) {
    const checkQuery = {
      text: 'SELECT id FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rowCount) {
      // Unlike
      const deleteQuery = {
        text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
        values: [commentId, owner],
      };
      await this._pool.query(deleteQuery);
    } else {
      // Like
      const id = `like-${this._idGenerator()}`;
      const insertQuery = {
        text: 'INSERT INTO likes VALUES($1, $2, $3)',
        values: [id, commentId, owner],
      };
      await this._pool.query(insertQuery);
    }
  }

  async getLikeCountByCommentIds(commentIds) {
    if (!commentIds.length) return [];

    const query = {
      text: `SELECT comment_id AS "commentId", COUNT(*) AS count
             FROM likes
             WHERE comment_id = ANY($1::text[])
             GROUP BY comment_id`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = LikeRepositoryPostgres;
