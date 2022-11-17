import { ServerRoute } from "@hapi/hapi";

import SongsHandler from "./handler";

export default (handler: SongsHandler): ServerRoute => ({
  method: "*",
  path: "/songs/{param*}",
  handler: handler.httpRequestHandler,
});
