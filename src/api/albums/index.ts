import { Plugin } from "@hapi/hapi";

import AlbumsHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<Record<string, any>>>{
  name: "albums",
  version: "1.6.2",
  // eslint-disable-next-line require-await
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
