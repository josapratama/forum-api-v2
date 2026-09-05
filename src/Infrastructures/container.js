const { createContainer, asClass, asValue, asFunction } = require("awilix");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const Jwt = require("@hapi/jwt");

const pool = require("./database/postgres/pool");

// Repositories
const UserRepositoryPostgres = require("./repository/UserRepositoryPostgres");
const AuthenticationRepositoryPostgres = require("./repository/AuthenticationRepositoryPostgres");
const ThreadRepositoryPostgres = require("./repository/ThreadRepositoryPostgres");
const CommentRepositoryPostgres = require("./repository/CommentRepositoryPostgres");
const ReplyRepositoryPostgres = require("./repository/ReplyRepositoryPostgres");
const LikeRepositoryPostgres = require("./repository/LikeRepositoryPostgres");

// Security
const BcryptPasswordHash = require("./security/BcryptPasswordHash");
const JwtTokenManager = require("./security/JwtTokenManager");

// Use Cases
const AddUserUseCase = require("../Applications/use_case/AddUserUseCase");
const LoginUserUseCase = require("../Applications/use_case/LoginUserUseCase");
const LogoutUserUseCase = require("../Applications/use_case/LogoutUserUseCase");
const RefreshAuthenticationUseCase = require("../Applications/use_case/RefreshAuthenticationUseCase");
const AddThreadUseCase = require("../Applications/use_case/AddThreadUseCase");
const GetThreadDetailUseCase = require("../Applications/use_case/GetThreadDetailUseCase");
const AddCommentUseCase = require("../Applications/use_case/AddCommentUseCase");
const DeleteCommentUseCase = require("../Applications/use_case/DeleteCommentUseCase");
const AddReplyUseCase = require("../Applications/use_case/AddReplyUseCase");
const DeleteReplyUseCase = require("../Applications/use_case/DeleteReplyUseCase");
const ToggleLikeUseCase = require("../Applications/use_case/ToggleLikeUseCase");

// Simple DI container (manual)
class ServiceContainer {
  constructor() {
    this._instances = {};
    this._pool = pool;
    this._idGenerator = nanoid;

    // repositories
    this._userRepository = new UserRepositoryPostgres(
      this._pool,
      this._idGenerator,
    );
    this._authenticationRepository = new AuthenticationRepositoryPostgres(
      this._pool,
    );
    this._threadRepository = new ThreadRepositoryPostgres(
      this._pool,
      this._idGenerator,
    );
    this._commentRepository = new CommentRepositoryPostgres(
      this._pool,
      this._idGenerator,
    );
    this._replyRepository = new ReplyRepositoryPostgres(
      this._pool,
      this._idGenerator,
    );
    this._likeRepository = new LikeRepositoryPostgres(
      this._pool,
      this._idGenerator,
    );

    // security
    this._passwordHash = new BcryptPasswordHash(bcrypt);
    this._tokenManager = new JwtTokenManager(Jwt);
  }

  getInstance(name) {
    switch (name) {
      case AddUserUseCase.name:
        return new AddUserUseCase({
          userRepository: this._userRepository,
          passwordHash: this._passwordHash,
        });

      case LoginUserUseCase.name:
        return new LoginUserUseCase({
          userRepository: this._userRepository,
          authenticationRepository: this._authenticationRepository,
          authenticationTokenManager: this._tokenManager,
          passwordHash: this._passwordHash,
        });

      case LogoutUserUseCase.name:
        return new LogoutUserUseCase({
          authenticationRepository: this._authenticationRepository,
        });

      case RefreshAuthenticationUseCase.name:
        return new RefreshAuthenticationUseCase({
          authenticationRepository: this._authenticationRepository,
          authenticationTokenManager: this._tokenManager,
        });

      case AddThreadUseCase.name:
        return new AddThreadUseCase({
          threadRepository: this._threadRepository,
        });

      case GetThreadDetailUseCase.name:
        return new GetThreadDetailUseCase({
          threadRepository: this._threadRepository,
          commentRepository: this._commentRepository,
          replyRepository: this._replyRepository,
          likeRepository: this._likeRepository,
        });

      case AddCommentUseCase.name:
        return new AddCommentUseCase({
          commentRepository: this._commentRepository,
          threadRepository: this._threadRepository,
        });

      case DeleteCommentUseCase.name:
        return new DeleteCommentUseCase({
          commentRepository: this._commentRepository,
        });

      case AddReplyUseCase.name:
        return new AddReplyUseCase({
          replyRepository: this._replyRepository,
          commentRepository: this._commentRepository,
          threadRepository: this._threadRepository,
        });

      case DeleteReplyUseCase.name:
        return new DeleteReplyUseCase({
          replyRepository: this._replyRepository,
        });

      case ToggleLikeUseCase.name:
        return new ToggleLikeUseCase({
          likeRepository: this._likeRepository,
          commentRepository: this._commentRepository,
          threadRepository: this._threadRepository,
        });

      default:
        throw new Error(`Unknown service: ${name}`);
    }
  }
}

module.exports = ServiceContainer;
