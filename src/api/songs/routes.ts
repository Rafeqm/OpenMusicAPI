import { ServerRoute } from "@hapi/hapi";

import SongsHandler from "./handler";

export default (handler: SongsHandler): ServerRoute | Array<ServerRoute> => [
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
];
