import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

console.log('Cleaning database for Postman testing...');

// Order matters due to foreign keys
await pool.query('TRUNCATE likes CASCADE');
await pool.query('TRUNCATE replies CASCADE');
await pool.query('TRUNCATE comments CASCADE');
await pool.query('TRUNCATE threads CASCADE');
await pool.query('TRUNCATE authentications CASCADE');
await pool.query('TRUNCATE users CASCADE');

console.log('✅ All tables truncated!');

// Verify
const r = await pool.query('SELECT COUNT(*) as c FROM users');
console.log('Users remaining:', r.rows[0].c);

await pool.end();
