// Set environment variables for testing
process.env.ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY || 'test_access_token_key_for_testing_purposes_only';
process.env.REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY || 'test_refresh_token_key_for_testing_purposes_only';
process.env.ACCESS_TOKEN_AGE = process.env.ACCESS_TOKEN_AGE || '1800';

// Test database config (uses same pool but with test db)
process.env.PGHOST = process.env.PGHOST_TEST || process.env.PGHOST || 'localhost';
process.env.PGPORT = process.env.PGPORT_TEST || process.env.PGPORT || '5432';
process.env.PGDATABASE = process.env.PGDATABASE_TEST || process.env.PGDATABASE || 'forumapi_test';
process.env.PGUSER = process.env.PGUSER_TEST || process.env.PGUSER || 'postgres';
process.env.PGPASSWORD = process.env.PGPASSWORD_TEST || process.env.PGPASSWORD || '';
