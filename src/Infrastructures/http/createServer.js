import express from "express";
import rateLimit from "express-rate-limit";
import ClientError from "../../Commons/exceptions/ClientError.js";
import DomainErrorTranslator from "../../Commons/exceptions/DomainErrorTranslator.js";
import users from "../../Interfaces/http/api/users/index.js";
import authentications from "../../Interfaces/http/api/authentications/index.js";
import threads from "../../Interfaces/http/api/threads/index.js";

// Rate limiter: 90 requests per minute for /threads and sub-paths
const threadsRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 90, // 90 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Terlalu banyak permintaan, coba lagi setelah 1 menit.",
  },
});

const createServer = async (container) => {
  const app = express();

  // Trust Railway's reverse proxy to get correct client IP for rate limiting
  app.set("trust proxy", 1);

  // Middleware for parsing JSON
  app.use(express.json());

  // Register routes with rate limiting on /threads
  app.use("/users", users(container));
  app.use("/authentications", authentications(container));
  app.use("/threads", threadsRateLimiter, threads(container));

  // Global error handler
  app.use((error, req, res, next) => {
    // bila response tersebut error, tangani sesuai kebutuhan
    const translatedError = DomainErrorTranslator.translate(error);

    // penanganan client error secara internal.
    if (translatedError instanceof ClientError) {
      return res.status(translatedError.statusCode).json({
        status: "fail",
        message: translatedError.message,
      });
    }

    // penanganan server error sesuai kebutuhan
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
