import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import { playlistPayloadSchema, songPayloadSchema } from "./schema.js";

export default {
  validatePlaylistPayload: async (payload: Request["payload"]) => {
    try {
      await playlistPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },

  validateSongPayload: async (payload: Request["payload"]) => {
    try {
      await songPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
