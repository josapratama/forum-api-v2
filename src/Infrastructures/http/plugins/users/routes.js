const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler.bind(handler),
  },
];

module.exports = routes;
