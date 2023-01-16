import { Plugin } from "@hapi/hapi";

import CollaborationsHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<Record<string, any>>>{
  name: "collaborations",
  version: "1.0.0",
  // eslint-disable-next-line require-await
  register: async (
    server,
    { collaborationsService, playlistsService, validator }
  ) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationsService,
      playlistsService,
      validator
    );

    server.route(routes(collaborationsHandler));
  },
};
