import { Plugin } from "@hapi/hapi";

import PlaylistsService from "../../services/database/PlaylistsService";
import exportsService from "../../services/message_queue/exportsService";
import exportsPayloadValidator from "../../validator/exports";
import ExportsHandler from "./handler.js";
import routes from "./routes.js";

type ExportsPluginOptions = {
  exportsService: typeof exportsService;
  playlistsService: PlaylistsService;
  validator: typeof exportsPayloadValidator;
};

export default <Plugin<ExportsPluginOptions>>{
  name: "exports",
  version: "1.0.0",
  // eslint-disable-next-line require-await, no-shadow
  register: async (server, { exportsService, playlistsService, validator }) => {
    const exportsHandler = new ExportsHandler(
      exportsService,
      playlistsService,
      validator
    );

    server.route(routes(exportsHandler));
  },
};
