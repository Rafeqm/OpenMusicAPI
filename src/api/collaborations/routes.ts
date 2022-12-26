import { ServerRoute } from "@hapi/hapi";

import CollaborationsHandler from "./handler";

export default (handler: CollaborationsHandler): ServerRoute => ({
  method: "*",
  path: "/collaborations/{param*}",
  handler: handler.httpRequestHandler,
});
