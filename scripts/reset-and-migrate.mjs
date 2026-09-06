import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log('Dropping all tables...');

// Drop in reverse order (foreign key dependencies)
const drops = [
  'DROP TABLE IF EXISTS likes CASCADE',
  'DROP TABLE IF EXISTS replies CASCADE',
  'DROP TABLE IF EXISTS comments CASCADE',
  'DROP TABLE IF EXISTS threads CASCADE',
  'DROP TABLE IF EXISTS authentications CASCADE',
  'DROP TABLE IF EXISTS users CASCADE',
  'DROP TABLE IF EXISTS pgmigrations CASCADE',
];

for (const sql of drops) {
  await pool.query(sql);
  console.log(`✓ ${sql}`);
}

console.log('\nRecreating tables with correct column order...');

await pool.query(`
  CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    fullname TEXT NOT NULL
  )
`);
console.log('✓ users');

await pool.query(`
  CREATE TABLE authentications (
    token TEXT NOT NULL
  )
`);
console.log('✓ authentications');

await pool.query(`
  CREATE TABLE threads (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    owner VARCHAR(50) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_threads_owner FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE
  )
`);
console.log('✓ threads (id, title, body, owner, date)');

await pool.query(`
  CREATE TABLE comments (
    id VARCHAR(50) PRIMARY KEY,
    thread_id VARCHAR(50) NOT NULL,
    owner VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_comments_thread FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_owner FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE
  )
`);
console.log('✓ comments (id, thread_id, owner, content, date, is_deleted)');

await pool.query(`
  CREATE TABLE replies (
    id VARCHAR(50) PRIMARY KEY,
    comment_id VARCHAR(50) NOT NULL,
    owner VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_replies_comment FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    CONSTRAINT fk_replies_owner FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE
  )
`);
console.log('✓ replies (id, comment_id, owner, content, date, is_deleted)');

await pool.query(`
  CREATE TABLE likes (
    id VARCHAR(50) PRIMARY KEY,
    comment_id VARCHAR(50) NOT NULL,
    owner VARCHAR(50) NOT NULL,
    CONSTRAINT fk_likes_comment FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_owner FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_likes UNIQUE(comment_id, owner)
  )
`);
console.log('✓ likes');

console.log('\n✅ All tables recreated!');
await pool.end();
