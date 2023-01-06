import { ServerRoute } from "@hapi/hapi";

import ExportsHandler from "./handler";

export default (handler: ExportsHandler): ServerRoute => ({
  method: "POST",
  path: "/export/playlists/{id}",
  handler: handler.postExportPlaylistById,
  options: {
    auth: "openmusicapi_jwt",
  },
});
