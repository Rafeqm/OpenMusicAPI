import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import { playlistPayloadSchema, playlistSongPayloadSchema } from "./schema.js";

export default {
  validate: async (
    payload: Request["payload"],
    entity: "playlist" | "song"
  ): Promise<void> => {
    try {
      await (entity === "playlist"
        ? playlistPayloadSchema
        : playlistSongPayloadSchema
      ).validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
