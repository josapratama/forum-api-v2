require('dotenv').config();

const createServer = require('./Infrastructures/http/createServer');
const ServiceContainer = require('./Infrastructures/container');

const start = async () => {
  const container = new ServiceContainer();
  const server = await createServer(container);
  await server.start();
  console.log(`Server berjalan di ${server.info.uri}`);
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
