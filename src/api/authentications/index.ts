import { Plugin } from "@hapi/hapi";

import AuthenticationsService from "../../services/database/AuthenticationsService";
import UsersService from "../../services/database/UsersService";
import authenticationsPayloadValidator from "../../validator/authentications";
import AuthenticationsHandler from "./handler.js";
import routes from "./routes.js";

type AuthenticationsPluginOptions = {
  authenticationsService: AuthenticationsService;
  usersService: UsersService;
  validator: typeof authenticationsPayloadValidator;
};

export default <Plugin<AuthenticationsPluginOptions>>{
  name: "authentications",
  version: "0.0.3",
  // eslint-disable-next-line require-await
  register: async (
    server,
    { authenticationsService, usersService, validator }
  ) => {
    const authenticationsHandler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      validator
    );

    server.route(routes(authenticationsHandler));
  },
};
