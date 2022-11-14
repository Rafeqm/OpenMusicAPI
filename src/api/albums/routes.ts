import { ServerRoute } from "@hapi/hapi";

import AlbumsHandler from "./handler";

export default (handler: AlbumsHandler): ServerRoute => ({
  method: "POST",
  path: "/albums",
  handler: handler.postAlbum,
});
