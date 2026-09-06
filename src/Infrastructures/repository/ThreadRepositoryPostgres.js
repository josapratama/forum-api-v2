import NotFoundError from "../../Commons/exceptions/NotFoundError.js";
import CreatedThread from "../../Domains/threads/entities/CreatedThread.js";
import ThreadRepository from "../../Domains/threads/ThreadRepository.js";

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(createThread) {
    const { title, body, owner } = createThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO threads (id, title, body, owner, date) VALUES($1, $2, $3, $4, NOW()) RETURNING id, title, owner",
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);
    return new CreatedThread({ ...result.rows[0] });
  }

  async verifyThreadExists(threadId) {
    const query = {
      text: "SELECT id FROM threads WHERE id = $1",
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }
  }

  async getThreadById(threadId) {
    const query = {
      text: `SELECT t.id, t.title, t.body, t.date, u.username
             FROM threads t
             JOIN users u ON t.owner = u.id
             WHERE t.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }

    return result.rows[0];
  }
}

export default ThreadRepositoryPostgres;
