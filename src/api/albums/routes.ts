import { ServerRoute } from "@hapi/hapi";

import AlbumsHandler from "./handler";

export default (handler: AlbumsHandler): ServerRoute | Array<ServerRoute> => [
  {
    method: "POST",
    path: "/albums",
    handler: handler.postAlbum,
  },
  {
    method: "GET",
    path: "/albums/{id}",
    handler: handler.getAlbumById,
  },
];
