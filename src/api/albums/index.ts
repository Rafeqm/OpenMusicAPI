import { Plugin } from "@hapi/hapi";

import AlbumsService from "../../services/database/AlbumsService";
import AlbumsPayloadValidator from "../../validator/albums";
import AlbumsHandler from "./handler.js";
import routes from "./routes.js";

type AlbumsPluginOptions = {
  service: AlbumsService;
  validator: typeof AlbumsPayloadValidator;
};

export default <Plugin<AlbumsPluginOptions>>{
  name: "albums",
  version: "1.0.2",
  // eslint-disable-next-line require-await
  register: async (server, { service, validator }) => {
    const albumsHandler = new AlbumsHandler(service, validator);
    server.route(routes(albumsHandler));
  },
};
