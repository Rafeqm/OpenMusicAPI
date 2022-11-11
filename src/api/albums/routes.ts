import { ServerRoute } from "@hapi/hapi";

import AlbumsHandler from "./handler";

export default (handler: AlbumsHandler): ServerRoute => ({
  method: "*",
  path: "/albums/{param*}",
  handler: handler.httpRequestHandler,
});
