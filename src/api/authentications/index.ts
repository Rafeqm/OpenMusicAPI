import { Plugin } from "@hapi/hapi";

import AuthenticationsHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<null>>{
  name: "authentications",
  version: "0.0.1",
  // eslint-disable-next-line require-await
  register: async (server) => {
    const authenticationsHandler = new AuthenticationsHandler();
    server.route(routes(authenticationsHandler));
  },
};
