import { ServerRoute } from "@hapi/hapi";

import ExportsHandler from "./handler";

export default (handler: ExportsHandler): ServerRoute => ({
  method: "*",
  path: "/export/{param*}",
  handler: handler.httpRequestHandler,
});
