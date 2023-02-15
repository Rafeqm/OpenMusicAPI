import { ServerRoute } from "@hapi/hapi";

import AlbumsHandler from "./handler";

export default (handler: AlbumsHandler): Array<ServerRoute> => [
  {
    method: "POST",
    path: "/albums",
    handler: handler.postAlbum,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/albums",
    handler: handler.getAlbums,
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
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/albums/{id}",
    handler: handler.deleteAlbumById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "POST",
    path: "/albums/{id}/covers",
    handler: handler.postAlbumCoverById,
    options: {
      auth: "openmusicapi_jwt",
      payload: {
        allow: "multipart/form-data",
        multipart: {
          output: "stream",
        },
        maxBytes: 524_288,
      },
    },
  },
  {
    method: "GET",
    path: "/albums/{id}/cover",
    handler: handler.getAlbumCoverById,
  },
  {
    method: "POST",
    path: "/albums/{id}/likes",
    handler: handler.postAlbumLikeById,
    options: {
      auth: "openmusicapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/albums/{id}/likes",
    handler: handler.getAlbumLikesCountById,
  },
];
