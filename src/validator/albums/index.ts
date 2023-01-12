import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import { albumPayloadSchema, coverImageHeadersSchema } from "./schema.js";

export default {
  validate: async (
    payload: Request["payload"],
    type: "album" | "coverImage" = "album"
  ) => {
    try {
      await (type === "album"
        ? albumPayloadSchema
        : coverImageHeadersSchema
      ).validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
