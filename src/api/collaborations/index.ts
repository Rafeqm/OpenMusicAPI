import { Plugin } from "@hapi/hapi";

import CollaborationsHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<null>>{
  name: "collaborations",
  version: "0.0.1",
  // eslint-disable-next-line require-await
  register: async (server) => {
    const collaborationsHandler = new CollaborationsHandler();
    server.route(routes(collaborationsHandler));
  },
};
