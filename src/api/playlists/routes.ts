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
  {
    method: "DELETE",
    path: "/playlists/{id}",
    handler: handler.deletePlaylistById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "POST",
    path: "/playlists/{id}/songs",
    handler: handler.postSongToPlaylistById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{id}/songs",
    handler: handler.getSongsInPlaylistById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
];
