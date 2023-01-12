import { Plugin } from "@hapi/hapi";

import AlbumsService from "../../services/database/AlbumsService";
import storageService from "../../services/storage/storageService";
import albumsPayloadValidator from "../../validator/albums";
import AlbumsHandler from "./handler.js";
import routes from "./routes.js";

type AlbumsPluginOptions = {
  albumsService: AlbumsService;
  storageService: typeof storageService;
  validator: typeof albumsPayloadValidator;
};

export default <Plugin<AlbumsPluginOptions>>{
  name: "albums",
  version: "1.2.0-alpha",
  // eslint-disable-next-line require-await, no-shadow
  register: async (server, { albumsService, storageService, validator }) => {
    const albumsHandler = new AlbumsHandler(
      albumsService,
      storageService,
      validator
    );

    server.route(routes(albumsHandler));
  },
};
