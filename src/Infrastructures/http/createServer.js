import express from "express";
import rateLimit from "express-rate-limit";
import ClientError from "../../Commons/exceptions/ClientError.js";
import DomainErrorTranslator from "../../Commons/exceptions/DomainErrorTranslator.js";
import users from "../../Interfaces/http/api/users/index.js";
import authentications from "../../Interfaces/http/api/authentications/index.js";
import threads from "../../Interfaces/http/api/threads/index.js";

// Build rate limiter store - use Redis in production if available, in-memory otherwise
const buildRateLimitStore = async () => {
  if (
    process.env.REDIS_URL &&
    process.env.REDIS_URL !== "redis://undefined:6379"
  ) {
    try {
      const { default: RedisStore } = await import("rate-limit-redis");
      const { default: Redis } = await import("ioredis");
      const client = new Redis(process.env.REDIS_URL, {
        enableOfflineQueue: false,
        lazyConnect: true,
        connectTimeout: 3000,
      });
      await client.connect().catch(() => null);
      const store = new RedisStore({
        sendCommand: (...args) => client.call(...args),
      });
      console.log("Rate limiter: using Redis store");
      return store;
    } catch (err) {
      console.error("Redis store failed, using memory store:", err.message);
    }
  }
  console.log("Rate limiter: using memory store");
  return undefined; // defaults to memory store
};

// Rate limiter: 90 requests per minute for /threads and sub-paths
const createThreadsRateLimiter = async () => {
  const store = await buildRateLimitStore();
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 90, // 90 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    store,
    keyGenerator: (req) => {
      const forwarded = req.headers["x-forwarded-for"];
      if (forwarded) return forwarded.split(",")[0].trim();
      return req.ip || req.connection.remoteAddress;
    },
    message: {
      status: "fail",
      message: "Terlalu banyak permintaan, coba lagi setelah 1 menit.",
    },
  });
};

const createServer = async (container) => {
  const app = express();

  // Trust Railway's reverse proxy to get correct client IP for rate limiting
  app.set("trust proxy", 1);

  // Middleware for parsing JSON
  app.use(express.json());

  // Build rate limiter (with Redis or memory store)
  const threadsRateLimiter = await createThreadsRateLimiter();

  // Register routes with rate limiting on /threads
  app.use("/users", users(container));
  app.use("/authentications", authentications(container));
  app.use("/threads", threadsRateLimiter, threads(container));

  // Global error handler
  app.use((error, req, res, next) => {
    const translatedError = DomainErrorTranslator.translate(error);

    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: "fail",
        message: translatedError.message,
      });
    }

    console.error("Unhandled error:", error);
    return res.status(500).json({
      status: "error",
      message: "terjadi kegagalan pada server kami",
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      status: "fail",
      message: "Route not found",
    });
  });

  return app;
};

export default createServer;
