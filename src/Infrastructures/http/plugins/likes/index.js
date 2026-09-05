const LikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  register: async (server) => {
    const handler = new LikesHandler(server.app.container);
    server.route(routes(handler));
  },
};
