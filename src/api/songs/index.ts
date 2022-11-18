import { Plugin } from "@hapi/hapi";

import SongsService from "../../services/database/SongsService";
import SongsPayloadValidator from "../../validator/songs";
import SongsHandler from "./handler.js";
import routes from "./routes.js";

type SongsPluginOptions = {
  service: SongsService;
  validator: typeof SongsPayloadValidator;
};

export default <Plugin<SongsPluginOptions>>{
  name: "songs",
  version: "0.3.0",
  // eslint-disable-next-line require-await
  register: async (server, { service, validator }) => {
    const songsHandler = new SongsHandler(service, validator);
    server.route(routes(songsHandler));
  },
};
