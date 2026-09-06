import express from "express";

const createThreadsRouter = (handler, authMiddleware) => {
  const router = express.Router();

  // Thread routes
  router.post("/", authMiddleware, handler.postThreadHandler);
  router.get("/:threadId", handler.getThreadDetailHandler);

  // Comment routes
  router.post(
    "/:threadId/comments",
    authMiddleware,
    handler.postCommentHandler,
  );
  router.delete(
    "/:threadId/comments/:commentId",
    authMiddleware,
    handler.deleteCommentHandler,
  );

  // Reply routes
  router.post(
    "/:threadId/comments/:commentId/replies",
    authMiddleware,
    handler.postReplyHandler,
  );
  router.delete(
    "/:threadId/comments/:commentId/replies/:replyId",
    authMiddleware,
    handler.deleteReplyHandler,
  );

  // Like routes
  router.put(
    "/:threadId/comments/:commentId/likes",
    authMiddleware,
    handler.putLikeHandler,
  );

  return router;
};

export default createThreadsRouter;
