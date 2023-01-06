import { Plugin } from "@hapi/hapi";

import exportsService from "../../services/message_queue/exportsService";
import exportsPayloadValidator from "../../validator/exports";
import ExportsHandler from "./handler.js";
import routes from "./routes.js";

type ExportsPluginOptions = {
  service: typeof exportsService;
  validator: typeof exportsPayloadValidator;
};

export default <Plugin<ExportsPluginOptions>>{
  name: "exports",
  version: "0.0.2",
  // eslint-disable-next-line require-await
  register: async (server, { service, validator }) => {
    const exportsHandler = new ExportsHandler(service, validator);
    server.route(routes(exportsHandler));
  },
};
