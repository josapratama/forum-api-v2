const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    threadId = 'thread-123',
    owner = 'user-123',
    content = 'sebuah comment',
    date = new Date().toISOString(),
    isDeleted = false,
  } = {}) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, owner, content, date, isDeleted],
    };
    await pool.query(query);
  },

  async findCommentById(id) {
    const result = await pool.query({ text: 'SELECT * FROM comments WHERE id = $1', values: [id] });
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
