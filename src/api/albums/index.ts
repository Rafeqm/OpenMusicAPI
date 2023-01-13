import { Plugin } from "@hapi/hapi";

import AlbumsService from "../../services/database/AlbumsService";
import StorageService from "../../services/storage/StorageService";
import albumsPayloadValidator from "../../validator/albums";
import uploadFileHeadersValidator from "../../validator/uploads";
import AlbumsHandler from "./handler.js";
import routes from "./routes.js";

type AlbumsPluginOptions = {
  albumsService: AlbumsService;
  storageService: StorageService;
  albumsValidator: typeof albumsPayloadValidator;
  uploadsValidator: typeof uploadFileHeadersValidator;
};

export default <Plugin<AlbumsPluginOptions>>{
  name: "albums",
  version: "1.3.1",
  // eslint-disable-next-line require-await, no-shadow
  register: async (
    server,
    { albumsService, storageService, albumsValidator, uploadsValidator }
  ) => {
    const albumsHandler = new AlbumsHandler(
      albumsService,
      storageService,
      albumsValidator,
      uploadsValidator
    );

    server.route(routes(albumsHandler));
  },
};
