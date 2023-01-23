import { ServerRoute } from "@hapi/hapi";

import SongsHandler from "./handler";

export default (handler: SongsHandler): Array<ServerRoute> => [
  {
    method: "POST",
    path: "/songs",
    handler: handler.postSong,
  },
  {
    method: "GET",
    path: "/songs",
    handler: handler.getSongs,
  },
  {
    method: "GET",
    path: "/songs/{id}",
    handler: handler.getSongById,
  },
  {
    method: "PUT",
    path: "/songs/{id}",
    handler: handler.putSongById,
  },
  {
    method: "DELETE",
    path: "/songs/{id}",
    handler: handler.deleteSongById,
  },
  {
    method: "POST",
    path: "/songs/{id}/audio",
    handler: handler.postSongAudioById,
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: {
          output: "stream",
        },
        maxBytes: 15_728_640,
      },
    },
  },
  {
    method: "GET",
    path: "/songs/{id}/audio",
    handler: handler.getSongAudioById,
  },
  {
    method: "POST",
    path: "/songs/{id}/likes",
    handler: handler.postSongLikeById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/songs/{id}/likes",
    handler: handler.getSongLikesById,
  },
];
