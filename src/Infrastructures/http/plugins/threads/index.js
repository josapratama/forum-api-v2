const ThreadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'threads',
  register: async (server) => {
    const handler = new ThreadsHandler(server.app.container);
    server.route(routes(handler));
  },
};
