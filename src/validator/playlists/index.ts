import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import { playlistPayloadSchema, playlistSongPayloadSchema } from "./schema.js";

export default {
  validatePlaylistPayload: async (payload: Request["payload"]) => {
    try {
      await playlistPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },

  validatePlaylistSongPayload: async (payload: Request["payload"]) => {
    try {
      await playlistSongPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
