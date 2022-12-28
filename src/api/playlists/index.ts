import { Plugin } from "@hapi/hapi";

import PlaylistsService from "../../services/database/PlaylistsService";
import playlistsPayloadValidator from "../../validator/playlists";
import PlaylistsHandler from "./handler.js";
import routes from "./routes.js";

type PlaylistsPluginOptions = {
  service: PlaylistsService;
  validator: typeof playlistsPayloadValidator;
};

export default <Plugin<PlaylistsPluginOptions>>{
  name: "playlists",
  version: "1.1.0",
  // eslint-disable-next-line require-await
  register: async (server, { service, validator }) => {
    const playlistsHandler = new PlaylistsHandler(service, validator);
    server.route(routes(playlistsHandler));
  },
};
