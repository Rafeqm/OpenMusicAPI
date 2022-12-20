import { Plugin } from "@hapi/hapi";

import PlaylistsHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<null>>{
  name: "playlists",
  version: "0.0.1",
  // eslint-disable-next-line require-await
  register: async (server) => {
    const playlistsHandler = new PlaylistsHandler();
    server.route(routes(playlistsHandler));
  },
};
