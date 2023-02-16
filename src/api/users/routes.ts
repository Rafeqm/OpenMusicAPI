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
  {
    method: "GET",
    path: "/users/{id}/avatar",
    handler: handler.getUserAvatarById,
  },
  {
    method: "DELETE",
    path: "/users/avatars",
    handler: handler.deleteUserAvatarById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "POST",
    path: "/users/{id}/followers",
    handler: handler.postUserFollowerById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/users/{id}/followers",
    handler: handler.getUserFollowersById,
  },
];
