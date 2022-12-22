import { ServerRoute } from "@hapi/hapi";

import AuthenticationsHandler from "./handler";

export default (handler: AuthenticationsHandler): Array<ServerRoute> => [
  {
    method: "POST",
    path: "/authentications",
    handler: handler.postAuthentication,
  },
  {
    method: "PUT",
    path: "/authentications",
    handler: handler.putAuthentication,
  },
  {
    method: "DELETE",
    path: "/authentications",
    handler: handler.deleteAuthentication,
  },
];
