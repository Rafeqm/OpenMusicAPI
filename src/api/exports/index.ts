import { Plugin } from "@hapi/hapi";

import ExportsHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<Record<string, any>>>{
  name: "exports",
  version: "1.0.0",
  // eslint-disable-next-line require-await, no-shadow
  register: async (server, { exportsService, playlistsService, validator }) => {
    const exportsHandler = new ExportsHandler(
      exportsService,
      playlistsService,
      validator
    );

    server.route(routes(exportsHandler));
  },
};
