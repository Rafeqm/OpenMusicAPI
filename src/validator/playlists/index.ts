import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import { playlistPayloadSchema, playlistSongsPayloadSchema } from "./schema.js";

export default {
  validate: async (
    payload: Request["payload"],
    entity: "playlist" | "song"
  ) => {
    try {
      await (entity === "playlist"
        ? playlistPayloadSchema
        : playlistSongsPayloadSchema
      ).validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
