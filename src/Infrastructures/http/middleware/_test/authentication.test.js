import createAuthenticationMiddleware from '../authentication.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';

describe('createAuthenticationMiddleware', () => {
  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const buildContainer = (overrides = {}) => {
    const mockTokenManager = {
      verifyAccessToken: vi.fn(() => Promise.resolve()),
      decodePayload: vi.fn(() => Promise.resolve({ id: 'user-123', username: 'dicoding' })),
      ...overrides,
    };
    return {
      getInstance: vi.fn((key) => {
        if (key === AuthenticationTokenManager.name) return mockTokenManager;
        return null;
      }),
      _tokenManager: mockTokenManager,
    };
  };

  it('should call next with AuthenticationError when authorization header is missing', async () => {
    const container = buildContainer();
    const middleware = createAuthenticationMiddleware(container);
    const req = { headers: {} };
    const res = {};

    await middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ name: 'AuthenticationError' }));
  });

  it('should call next with AuthenticationError when scheme is not Bearer', async () => {
    const container = buildContainer();
    const middleware = createAuthenticationMiddleware(container);
    const req = { headers: { authorization: 'Basic sometoken' } };
    const res = {};

    await middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ name: 'AuthenticationError' }));
  });

  it('should call next with AuthenticationError when token is missing', async () => {
    const container = buildContainer();
    const middleware = createAuthenticationMiddleware(container);
    const req = { headers: { authorization: 'Bearer' } };
    const res = {};

    await middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ name: 'AuthenticationError' }));
  });

  it('should call next with AuthenticationError when access token verification fails', async () => {
    const container = buildContainer({
      verifyAccessToken: vi.fn(() => Promise.reject(new Error('invalid token'))),
    });
    const middleware = createAuthenticationMiddleware(container);
    const req = { headers: { authorization: 'Bearer invalidtoken' } };
    const res = {};

    await middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ name: 'AuthenticationError' }));
  });

  it('should set req.auth and call next() when token is valid', async () => {
    const container = buildContainer();
    const middleware = createAuthenticationMiddleware(container);
    const req = { headers: { authorization: 'Bearer validtoken' } };
    const res = {};

    await middleware(req, res, mockNext);

    expect(req.auth).toEqual({ credentials: { id: 'user-123', username: 'dicoding' } });
    expect(mockNext).toHaveBeenCalledWith();
  });
});
