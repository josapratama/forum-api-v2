const createServer = require("../createServer");

describe("createServer", () => {
  it("should response 404 when accessing unknown route", async () => {
    const server = await createServer({});
    const response = await server.inject({
      method: "GET",
      url: "/unknown",
    });
    expect(response.statusCode).toBe(404);
  });

  it("should handle server error correctly", async () => {
    const requestPayload = {
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding Indonesia",
    };
    const server = await createServer({
      getInstance: () => {
        throw new Error("Error test");
      },
    });

    const response = await server.inject({
      method: "POST",
      url: "/users",
      payload: requestPayload,
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toBe(500);
    expect(responseJson.status).toBe("error");
    expect(responseJson.message).toBe("terjadi kegagalan pada server kami");
  });
});
