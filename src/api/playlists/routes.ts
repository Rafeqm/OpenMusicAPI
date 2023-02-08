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
    method: "PUT",
    path: "/playlists/{id}",
    handler: handler.putPlaylistById,
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
    handler: handler.postPlaylistSongById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{id}/songs",
    handler: handler.getPlaylistSongsById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{id}/songs",
    handler: handler.deletePlaylistSongById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{id}/activities",
    handler: handler.getActivitiesOnPlaylistById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "POST",
    path: "/playlists/{id}/likes",
    handler: handler.postPlaylistLikeById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{id}/likes",
    handler: handler.getPlaylistLikesById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
];
