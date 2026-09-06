import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  try {
    // Likes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id VARCHAR(50) PRIMARY KEY,
        comment_id VARCHAR(50) NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        owner VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT unique_likes_per_user_per_comment UNIQUE(comment_id, owner)
      )
    `);
    console.log('✓ likes table ready');
    console.log('✅ Migration complete!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((e) => { console.error(e.message); process.exit(1); });
