import ThreadsHandler from './handler.js';
import createThreadsRouter from './routes.js';
import createAuthenticationMiddleware from '../../../../Infrastructures/http/middleware/authentication.js';

export default (container) => {
  const threadsHandler = new ThreadsHandler(container);
  const authMiddleware = createAuthenticationMiddleware(container);
  return createThreadsRouter(threadsHandler, authMiddleware);
};
