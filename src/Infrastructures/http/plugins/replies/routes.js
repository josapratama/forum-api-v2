const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: handler.postReplyHandler.bind(handler),
    options: { auth: 'forumapi_jwt' },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: handler.deleteReplyHandler.bind(handler),
    options: { auth: 'forumapi_jwt' },
  },
];

module.exports = routes;
