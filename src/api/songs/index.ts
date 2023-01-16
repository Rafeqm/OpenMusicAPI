import { Plugin } from "@hapi/hapi";

import SongsHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<Record<string, any>>>{
  name: "songs",
  version: "1.1.0",
  // eslint-disable-next-line require-await
  register: async (server, { service, validator }) => {
    const songsHandler = new SongsHandler(service, validator);
    server.route(routes(songsHandler));
  },
};
