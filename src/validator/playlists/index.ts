import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import { playlistPayloadSchema, playlistSongPayloadSchema } from "./schema.js";

export default {
  validate: async (
    target: "playlist" | "song",
    payload: Request["payload"]
  ): Promise<void> => {
    try {
      await (target === "playlist"
        ? playlistPayloadSchema
        : playlistSongPayloadSchema
      ).validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
