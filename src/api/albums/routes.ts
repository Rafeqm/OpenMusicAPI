import { ServerRoute } from "@hapi/hapi";

import AlbumsHandler from "./handler";

export default (handler: AlbumsHandler): Array<ServerRoute> => [
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
  {
    method: "PUT",
    path: "/albums/{id}",
    handler: handler.putAlbumById,
  },
  {
    method: "DELETE",
    path: "/albums/{id}",
    handler: handler.deleteAlbumById,
  },
];
