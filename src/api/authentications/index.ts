import { Plugin } from "@hapi/hapi";

import AuthenticationsService from "../../services/database/AuthenticationsService";
import authenticationsPayloadValidator from "../../validator/authentications";
import AuthenticationsHandler from "./handler.js";
import routes from "./routes.js";

type AuthenticationsPluginOptions = {
  service: AuthenticationsService;
  validator: typeof authenticationsPayloadValidator;
};

export default <Plugin<AuthenticationsPluginOptions>>{
  name: "authentications",
  version: "0.0.2",
  // eslint-disable-next-line require-await
  register: async (server, { service, validator }) => {
    const authenticationsHandler = new AuthenticationsHandler(
      service,
      validator
    );

    server.route(routes(authenticationsHandler));
  },
};
