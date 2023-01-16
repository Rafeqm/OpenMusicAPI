import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import { songPayloadSchema } from "./schema.js";

export default {
  validateSongPayload: async (payload: Request["payload"]) => {
    try {
      await songPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
