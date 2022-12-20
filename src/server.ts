import { Server } from "@hapi/hapi";
import dotenv from "dotenv";

import albums from "./api/albums/index.js";
import AlbumsService from "./services/database/AlbumsService.js";
import albumsPayloadValidator from "./validator/albums/index.js";

import songs from "./api/songs/index.js";
import SongsService from "./services/database/SongsService.js";
import songsPayloadValidator from "./validator/songs/index.js";

import users from "./api/users/index.js";
import UsersService from "./services/database/UsersService.js";
import usersPayloadValidator from "./validator/users/index.js";

import authentications from "./api/authentications/index.js";
import AuthenticationsService from "./services/database/AuthenticationsService.js";
import { tokenManager } from "./utils/tokenize.js";
import authenticationsPayloadValidator from "./validator/authentications/index.js";

import playlists from "./api/playlists/index.js";

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
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: albumsPayloadValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: songsPayloadValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: usersPayloadValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        validator: authenticationsPayloadValidator,
        tokenManager,
      },
    },
    {
      plugin: playlists,
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Internal server error handling
      if (response.isServer) {
        console.error(response);
        return h
          .response({
            status: "error",
            message: "Something went wrong",
          })
          .code(500);
      }

      // Automatic client error handling by @hapi/boom
      if (response.isBoom) {
        return h
          .response({
            status: "fail",
            message: response.message,
          })
          .code(response.output.statusCode);
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
