import { ServerRoute } from "@hapi/hapi";

import AuthenticationsHandler from "./handler";

export default (handler: AuthenticationsHandler): ServerRoute => ({
  method: "*",
  path: "/authentications/{param*}",
  handler: handler.httpRequestHandler,
});
