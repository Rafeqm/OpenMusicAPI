import { Plugin } from "@hapi/hapi";

import CollaborationsService from "../../services/database/CollaborationsService";
import PlaylistsService from "../../services/database/PlaylistsService";
import collaborationsPayloadValidator from "../../validator/collaborations";
import CollaborationsHandler from "./handler.js";
import routes from "./routes.js";

type CollaborationsPluginOptions = {
  collaborationsService: CollaborationsService;
  playlistsService: PlaylistsService;
  validator: typeof collaborationsPayloadValidator;
};

export default <Plugin<CollaborationsPluginOptions>>{
  name: "collaborations",
  version: "0.1.0",
  // eslint-disable-next-line require-await
  register: async (
    server,
    { collaborationsService, playlistsService, validator }
  ) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationsService,
      playlistsService,
      validator
    );

    server.route(routes(collaborationsHandler));
  },
};
