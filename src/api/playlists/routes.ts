import { ServerRoute } from "@hapi/hapi";

import PlaylistsHandler from "./handler";

export default (handler: PlaylistsHandler): ServerRoute => ({
  method: "*",
  path: "/playlists/{param*}",
  handler: handler.httpRequestHandler,
});
