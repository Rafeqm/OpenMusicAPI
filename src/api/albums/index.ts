import { Plugin } from "@hapi/hapi";

import AlbumsHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<null>>{
  name: "albums",
  version: "0.0.0",
  // eslint-disable-next-line require-await
  register: async (server) => {
    const albumsHandler = new AlbumsHandler();
    server.route(routes(albumsHandler));
  },
};
