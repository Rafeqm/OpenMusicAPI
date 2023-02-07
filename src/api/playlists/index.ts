import { Plugin } from "@hapi/hapi";

import PlaylistsHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<Record<string, any>>>{
  name: "playlists",
  version: "1.4.3",
  // eslint-disable-next-line require-await
  register: async (server, { service, validator }) => {
    const playlistsHandler = new PlaylistsHandler(service, validator);
    server.route(routes(playlistsHandler));
  },
};
