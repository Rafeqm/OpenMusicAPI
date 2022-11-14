import { Server } from "@hapi/hapi";
import dotenv from "dotenv";

import albums from "./api/albums/index.js";
import AlbumsService from "./services/database/AlbumsService.js";

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

  const albumsService = new AlbumsService();

  await server.register({
    plugin: albums,
    options: {
      service: albumsService,
    },
  });

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
};

init();
