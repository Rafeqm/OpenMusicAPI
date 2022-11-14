import { Plugin } from "@hapi/hapi";

import AlbumsService from "../../services/database/AlbumsService";
import AlbumsHandler from "./handler.js";
import routes from "./routes.js";

type AlbumsPluginOptions = {
  service: AlbumsService;
};

export default <Plugin<AlbumsPluginOptions>>{
  name: "albums",
  version: "0.1.0",
  // eslint-disable-next-line require-await
  register: async (server, { service }) => {
    const albumsHandler = new AlbumsHandler(service);
    server.route(routes(albumsHandler));
  },
};
