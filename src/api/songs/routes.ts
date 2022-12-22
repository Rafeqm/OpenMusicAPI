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
];
