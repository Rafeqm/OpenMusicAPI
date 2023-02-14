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
  {
    method: "PUT",
    path: "/users",
    handler: handler.putUserByCredential,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "POST",
    path: "/users/avatars",
    handler: handler.postUserAvatarById,
    options: {
      auth: "openmusicapi_jwt",
      payload: {
        allow: "multipart/form-data",
        multipart: {
          output: "stream",
        },
        maxBytes: 524_288,
      },
    },
  },
];
