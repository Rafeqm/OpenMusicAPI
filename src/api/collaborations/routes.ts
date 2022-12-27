import { ServerRoute } from "@hapi/hapi";

import CollaborationsHandler from "./handler";

export default (handler: CollaborationsHandler): ServerRoute => ({
  method: "POST",
  path: "/collaborations",
  handler: handler.postCollaboration,
  options: {
    auth: "openmusicapi_jwt",
  },
});
