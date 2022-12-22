import { ServerRoute } from "@hapi/hapi";

import PlaylistsHandler from "./handler";

export default (handler: PlaylistsHandler): Array<ServerRoute> => [
  {
    method: "POST",
    path: "/playlists",
    handler: handler.postPlaylist,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists",
    handler: handler.getPlaylists,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
];
