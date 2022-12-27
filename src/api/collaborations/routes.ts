import { ServerRoute } from "@hapi/hapi";

import CollaborationsHandler from "./handler";

export default (handler: CollaborationsHandler): Array<ServerRoute> => [
  {
    method: "POST",
    path: "/collaborations",
    handler: handler.postCollaboration,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/collaborations",
    handler: handler.deleteCollaboration,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
];
