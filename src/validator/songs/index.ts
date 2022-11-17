import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import SongPayloadSchema from "./schema.js";

export default {
  /** Intended only for necessary/certain use case (e.g. performance testing). */
  validate: (payload: Request["payload"]) => {
    const validationResult = SongPayloadSchema.validate(payload);

    if (validationResult.error !== undefined) {
      throw badRequest(validationResult.error.message);
    }
  },

  validateAsync: async (payload: Request["payload"]) => {
    try {
      await SongPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
