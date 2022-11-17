import { Plugin } from "@hapi/hapi";

import SongsHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<null>>{
  name: "songs",
  version: "0.0.1",
  // eslint-disable-next-line require-await
  register: async (server) => {
    const songsHandler = new SongsHandler();
    server.route(routes(songsHandler));
  },
};
