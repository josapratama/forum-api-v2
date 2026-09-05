const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postCommentHandler.bind(handler),
    options: { auth: 'forumapi_jwt' },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentHandler.bind(handler),
    options: { auth: 'forumapi_jwt' },
  },
];

module.exports = routes;
