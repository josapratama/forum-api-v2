const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.postAuthenticationHandler.bind(handler),
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.putAuthenticationHandler.bind(handler),
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthenticationHandler.bind(handler),
  },
];

module.exports = routes;
