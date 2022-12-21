import { ServerRoute } from "@hapi/hapi";

import PlaylistsHandler from "./handler";

export default (handler: PlaylistsHandler): ServerRoute => ({
  method: "POST",
  path: "/playlists",
  handler: handler.postPlaylist,
  options: {
    auth: "openmusicapi_jwt",
  },
});
