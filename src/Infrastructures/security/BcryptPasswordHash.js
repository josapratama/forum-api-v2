const bcrypt = require("bcryptjs");
const AuthenticationError = require("../../Commons/exceptions/AuthenticationError");

class BcryptPasswordHash {
  constructor(bcryptLib, saltRound = 10) {
    this._bcrypt = bcryptLib;
    this._saltRound = saltRound;
  }

  async hash(password) {
    return this._bcrypt.hash(password, this._saltRound);
  }

  async comparePassword(password, hashedPassword) {
    const result = await this._bcrypt.compare(password, hashedPassword);
    if (!result) {
      throw new AuthenticationError("kredensial yang Anda berikan salah");
    }
  }
}

module.exports = BcryptPasswordHash;
