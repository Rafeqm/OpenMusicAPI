import { ServerRoute } from "@hapi/hapi";

import AuthenticationsHandler from "./handler";

export default (handler: AuthenticationsHandler): ServerRoute => ({
  method: "POST",
  path: "/authentications",
  handler: handler.postAuthentication,
});
