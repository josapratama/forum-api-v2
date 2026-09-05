const bcrypt = require("bcryptjs");
const BcryptPasswordHash = require("../BcryptPasswordHash");
const AuthenticationError = require("../../../Commons/exceptions/AuthenticationError");

describe("BcryptPasswordHash", () => {
  describe("hash", () => {
    it("should hash password correctly", async () => {
      const passwordHash = new BcryptPasswordHash(bcrypt);
      const hashed = await passwordHash.hash("secret");
      const isMatch = await bcrypt.compare("secret", hashed);
      expect(isMatch).toBe(true);
    });
  });

  describe("comparePassword", () => {
    it("should throw AuthenticationError when password mismatch", async () => {
      const passwordHash = new BcryptPasswordHash(bcrypt);
      const hashed = await bcrypt.hash("secret", 10);
      await expect(
        passwordHash.comparePassword("wrong", hashed),
      ).rejects.toThrow(AuthenticationError);
    });

    it("should not throw when password matches", async () => {
      const passwordHash = new BcryptPasswordHash(bcrypt);
      const hashed = await bcrypt.hash("secret", 10);
      await expect(
        passwordHash.comparePassword("secret", hashed),
      ).resolves.not.toThrow();
    });
  });
});
