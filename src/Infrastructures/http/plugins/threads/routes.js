const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler.bind(handler),
    options: {
      auth: 'forumapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getThreadDetailHandler.bind(handler),
  },
];

module.exports = routes;
