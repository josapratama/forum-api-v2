const RepliesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'replies',
  register: async (server) => {
    const handler = new RepliesHandler(server.app.container);
    server.route(routes(handler));
  },
};
