const CommentsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'comments',
  register: async (server) => {
    const handler = new CommentsHandler(server.app.container);
    server.route(routes(handler));
  },
};
