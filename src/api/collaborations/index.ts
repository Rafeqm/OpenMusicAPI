import { Plugin } from "@hapi/hapi";

import CollaborationsService from "../../services/database/CollaborationsService";
import collaborationsPayloadValidator from "../../validator/collaborations";
import CollaborationsHandler from "./handler.js";
import routes from "./routes.js";

type CollaborationsPluginOptions = {
  service: CollaborationsService;
  validator: typeof collaborationsPayloadValidator;
};

export default <Plugin<CollaborationsPluginOptions>>{
  name: "collaborations",
  version: "0.0.2",
  // eslint-disable-next-line require-await
  register: async (server, { service, validator }) => {
    const collaborationsHandler = new CollaborationsHandler(service, validator);
    server.route(routes(collaborationsHandler));
  },
};
