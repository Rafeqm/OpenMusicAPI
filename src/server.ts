import { Server } from "@hapi/hapi";
import dotenv from "dotenv";

import albums from "./api/albums/index.js";
import AlbumsService from "./services/database/AlbumsService.js";
import AlbumsPayloadValidator from "./validator/albums/index.js";

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
      validator: AlbumsPayloadValidator,
    },
  });

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Automatic client error handling by @hapi/boom
      if (response.isBoom) {
        return h
          .response({
            status: "fail",
            message: response.message,
          })
          .code(response.output.statusCode);
      }

      // Internal server error handling
      if (response.isServer) {
        console.error(response);
        return h
          .response({
            status: "error",
            message: "Sorry, there was a failure on our server.",
          })
          .code(500);
      }

      // Native client error handling by @hapi/hapi (e.g. 404, etc)
      return h.continue;
    }

    return h.continue;
  });

  server.ext("onPostStart", () => {
    console.log(`Server is ready at ${server.info.uri}`);
  });

  await server.start();
};

init();
