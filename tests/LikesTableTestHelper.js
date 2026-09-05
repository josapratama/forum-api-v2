const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({ id = 'like-123', commentId = 'comment-123', owner = 'user-123' } = {}) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [id, commentId, owner],
    };
    await pool.query(query);
  },

  async findLikeByCommentIdAndOwner(commentId, owner) {
    const result = await pool.query({
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    });
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
