import express from "express";
import ClientError from "../../Commons/exceptions/ClientError.js";
import DomainErrorTranslator from "../../Commons/exceptions/DomainErrorTranslator.js";
import users from "../../Interfaces/http/api/users/index.js";
import authentications from "../../Interfaces/http/api/authentications/index.js";
import threads from "../../Interfaces/http/api/threads/index.js";

// Rate limiting diterapkan sepenuhnya di NGINX (nginx.conf)
// limit_req_zone $binary_remote_addr zone=threads_limit:10m rate=90r/m;
// location ~ ^/threads { limit_req zone=threads_limit nodelay; limit_req_status 429; }

const createServer = async (container) => {
  const app = express();

  // Middleware for parsing JSON
  app.use(express.json());

  // Register routes - NO rate limiting here, handled by NGINX
  app.use("/users", users(container));
  app.use("/authentications", authentications(container));
  app.use("/threads", threads(container));

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
