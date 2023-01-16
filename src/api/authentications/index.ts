import { Plugin } from "@hapi/hapi";

import AuthenticationsHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<Record<string, any>>>{
  name: "authentications",
  version: "1.0.0",
  // eslint-disable-next-line require-await
  register: async (
    server,
    // eslint-disable-next-line no-shadow
    { authenticationsService, usersService, validator, tokenManager }
  ) => {
    const authenticationsHandler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      validator,
      tokenManager
    );

    server.route(routes(authenticationsHandler));
  },
};
