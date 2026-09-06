import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Check table structures
for (const table of ['users', 'threads', 'comments', 'replies', 'likes', 'authentications']) {
  const r = await pool.query(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [table]);
  console.log(`\n=== ${table} ===`);
  r.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable}, default: ${c.column_default})`));
}

await pool.end();
