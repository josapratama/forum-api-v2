import AuthenticationTokenManager from "../../../Applications/security/AuthenticationTokenManager.js";
import AuthenticationError from "../../../Commons/exceptions/AuthenticationError.js";

const createAuthenticationMiddleware =
  (container) => async (req, res, next) => {
    try {
      const { authorization } = req.headers;

      if (!authorization) {
        throw new AuthenticationError("Missing authentication");
      }

      const [scheme, token] = authorization.split(" ");

      if (scheme !== "Bearer" || !token) {
        throw new AuthenticationError("Missing authentication");
      }

      const authenticationTokenManager = container.getInstance(
        AuthenticationTokenManager.name,
      );
      try {
        await authenticationTokenManager.verifyAccessToken(token);
      } catch {
        throw new AuthenticationError("access token tidak valid");
      }
      const { id, username } =
        await authenticationTokenManager.decodePayload(token);

      req.auth = { credentials: { id, username } };

      next();
    } catch (error) {
      next(error);
    }
  };

export default createAuthenticationMiddleware;
