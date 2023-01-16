import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import { userPayloadSchema } from "./schema.js";

export default {
  validateUserPayload: async (payload: Request["payload"]) => {
    try {
      await userPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
