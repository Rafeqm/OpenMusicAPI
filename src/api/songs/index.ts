import { Plugin } from "@hapi/hapi";

import SongsHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<Record<string, any>>>{
  name: "songs",
  version: "1.5.5",
  // eslint-disable-next-line require-await
  register: async (
    server,
    { songsService, storageService, songsValidator, uploadsValidator }
  ) => {
    const songsHandler = new SongsHandler(
      songsService,
      storageService,
      songsValidator,
      uploadsValidator
    );

    server.route(routes(songsHandler));
  },
};
