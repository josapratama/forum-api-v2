import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const r = await pool.query('SELECT COUNT(*) as c FROM users');
console.log('Users in DB:', r.rows[0].c);

const r2 = await pool.query('SELECT username FROM users ORDER BY username LIMIT 10');
r2.rows.forEach(row => console.log(' -', row.username));

await pool.end();
