import { Server } from "@hapi/hapi";
import Inert from "@hapi/inert";
import Jwt from "@hapi/jwt";
import dotenv from "dotenv";

import albums from "./api/albums/index.js";
import AlbumsService from "./services/database/AlbumsService.js";
import albumsValidator from "./validator/albums/index.js";

import songs from "./api/songs/index.js";
import SongsService from "./services/database/SongsService.js";
import songsValidator from "./validator/songs/index.js";

import users from "./api/users/index.js";
import UsersService from "./services/database/UsersService.js";
import usersValidator from "./validator/users/index.js";

import authentications from "./api/authentications/index.js";
import AuthenticationsService from "./services/database/AuthenticationsService.js";
import { tokenManager } from "./utils/tokenize.js";
import authenticationsValidator from "./validator/authentications/index.js";

import playlists from "./api/playlists/index.js";
import PlaylistsService from "./services/database/PlaylistsService.js";
import playlistsValidator from "./validator/playlists/index.js";

import collaborations from "./api/collaborations/index.js";
import CollaborationsService from "./services/database/CollaborationsService.js";
import collaborationsValidator from "./validator/collaborations/index.js";

import _exports from "./api/exports/index.js";
import exportsService from "./services/message_queue/exportsService.js";
import exportsValidator from "./validator/exports/index.js";

import StorageService from "./services/storage/StorageService.js";
import uploadsValidator from "./validator/uploads/index.js";

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

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy("openmusicapi_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts: any) => ({
      isValid: true,
      credentials: {
        userId: artifacts.decoded.payload.userId,
      },
    }),
  });

  const albumsService = new AlbumsService();
  const albumsStorageService = new StorageService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(
    songsService,
    collaborationsService
  );

  await server.register([
    {
      plugin: albums,
      options: {
        albumsService,
        storageService: albumsStorageService,
        albumsValidator,
        uploadsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: songsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: usersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        validator: authenticationsValidator,
        tokenManager,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: playlistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: collaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        exportsService,
        playlistsService,
        validator: exportsValidator,
      },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Internal server error handling
      if (response.isServer) {
        console.error(`${response.name}\n${response.stack}\n`);
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
