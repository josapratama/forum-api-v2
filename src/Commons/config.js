/* istanbul ignore file */
import dotenv from "dotenv";
import path from "path";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: path.resolve(process.cwd(), ".test.env") });
} else {
  dotenv.config();
}

// Support DATABASE_URL (Railway/Neon) atau individual PG* vars
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    };
  }
  return {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  };
};

const config = {
  app: {
    host: process.env.NODE_ENV !== "production" ? "localhost" : "0.0.0.0",
    port: process.env.PORT || 5000,
  },
  database: getDatabaseConfig(),
  auth: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenAge:
      process.env.ACCCESS_TOKEN_AGE || process.env.ACCESS_TOKEN_AGE || 3000,
  },
};

export default config;
