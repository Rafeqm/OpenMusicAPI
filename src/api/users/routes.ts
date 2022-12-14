import { ServerRoute } from "@hapi/hapi";

import UsersHandler from "./handler";

export default (handler: UsersHandler): ServerRoute => ({
  method: "POST",
  path: "/users",
  handler: handler.postUser,
});
