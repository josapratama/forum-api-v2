const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  register: async (server) => {
    const handler = new AuthenticationsHandler(server.app.container);
    server.route(routes(handler));
  },
};
