import { ServerRoute } from "@hapi/hapi";

import UsersHandler from "./handler";

export default (handler: UsersHandler): Array<ServerRoute> => [
  {
    method: "POST",
    path: "/users",
    handler: handler.postUser,
  },
  {
    method: "GET",
    path: "/users",
    handler: handler.getUsers,
  },
  {
    method: "GET",
    path: "/users/{id}",
    handler: handler.getUserById,
  },
];
