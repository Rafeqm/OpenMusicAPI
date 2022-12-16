import { Plugin } from "@hapi/hapi";

import AuthenticationsService from "../../services/database/AuthenticationsService";
import UsersService from "../../services/database/UsersService";
import { tokenManager } from "../../utils/tokenize";
import authenticationsPayloadValidator from "../../validator/authentications";
import AuthenticationsHandler from "./handler.js";
import routes from "./routes.js";

type AuthenticationsPluginOptions = {
  authenticationsService: AuthenticationsService;
  usersService: UsersService;
  validator: typeof authenticationsPayloadValidator;
  tokenManager: typeof tokenManager;
};

export default <Plugin<AuthenticationsPluginOptions>>{
  name: "authentications",
  version: "0.1.0",
  // eslint-disable-next-line require-await
  register: async (
    server,
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
