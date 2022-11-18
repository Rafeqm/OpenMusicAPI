import { ServerRoute } from "@hapi/hapi";

import SongsHandler from "./handler";

export default (handler: SongsHandler): ServerRoute => ({
  method: "POST",
  path: "/songs",
  handler: handler.postSong,
});
