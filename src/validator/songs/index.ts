import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import SongPayloadSchema from "./schema.js";

export default {
  validate: async (payload: Request["payload"]) => {
    try {
      await SongPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
