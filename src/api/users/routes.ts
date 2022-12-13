import { ServerRoute } from "@hapi/hapi";

import UsersHandler from "./handler";

export default (handler: UsersHandler): ServerRoute => ({
  method: "*",
  path: "/users/{param*}",
  handler: handler.httpRequestHandler,
});
