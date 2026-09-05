const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    commentId = 'comment-123',
    threadId = 'thread-123',
    owner = 'user-123',
    content = 'sebuah reply',
    date = new Date().toISOString(),
    isDeleted = false,
  } = {}) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7)',
      values: [id, commentId, threadId, owner, content, date, isDeleted],
    };
    await pool.query(query);
  },

  async findReplyById(id) {
    const result = await pool.query({ text: 'SELECT * FROM replies WHERE id = $1', values: [id] });
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
