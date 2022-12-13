import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import AlbumPayloadSchema from "./schema.js";

export default {
  validate: async (payload: Request["payload"]) => {
    try {
      await AlbumPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
