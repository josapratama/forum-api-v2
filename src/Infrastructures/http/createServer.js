const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');

const usersPlugin = require('./plugins/users');
const authenticationsPlugin = require('./plugins/authentications');
const threadsPlugin = require('./plugins/threads');
const commentsPlugin = require('./plugins/comments');
const repliesPlugin = require('./plugins/replies');
const likesPlugin = require('./plugins/likes');

const createServer = async (container) => {
  const server = Hapi.server({
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 5000,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.app.container = container;

  await server.register([Jwt]);

  server.auth.strategy('forumapi_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE || 1800,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
        username: artifacts.decoded.payload.username,
      },
    }),
  });

  await server.register([
    usersPlugin,
    authenticationsPlugin,
    threadsPlugin,
    commentsPlugin,
    repliesPlugin,
    likesPlugin,
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      const translatedError = DomainErrorTranslator.translate(response);

      if (translatedError instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: translatedError.message,
        }).code(translatedError.statusCode);
      }

      if (!translatedError.isServer) {
        return h.continue;
      }

      console.error(translatedError);
      return h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      }).code(500);
    }

    return h.continue;
  });

  return server;
};

module.exports = createServer;
