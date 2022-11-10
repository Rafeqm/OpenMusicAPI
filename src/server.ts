import { Server } from "@hapi/hapi";
import dotenv from "dotenv";

dotenv.config();

const init = async () => {
  const server = new Server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
};

init();
