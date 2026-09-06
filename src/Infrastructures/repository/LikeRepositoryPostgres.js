import LikeRepository from '../../Domains/likes/LikeRepository.js';

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async toggleLike(commentId, owner) {
    // Cek apakah sudah like
    const checkQuery = {
      text: 'SELECT id FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };
    const check = await this._pool.query(checkQuery);

    if (check.rowCount) {
      // Sudah like → unlike (hapus)
      const deleteQuery = {
        text: 'DELETE FROM likes WHERE comment_id = $1 AND owner = $2',
        values: [commentId, owner],
      };
      await this._pool.query(deleteQuery);
    } else {
      // Belum like → like (tambah)
      const id = `like-${this._idGenerator()}`;
      const insertQuery = {
        text: 'INSERT INTO likes VALUES($1, $2, $3)',
        values: [id, commentId, owner],
      };
      await this._pool.query(insertQuery);
    }
  }

  async getLikeCountsByCommentIds(commentIds) {
    if (!commentIds.length) return [];

    const query = {
      text: `SELECT comment_id, COUNT(*)::int AS count
             FROM likes
             WHERE comment_id = ANY($1::text[])
             GROUP BY comment_id`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

export default LikeRepositoryPostgres;
