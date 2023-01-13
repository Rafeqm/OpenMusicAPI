import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import albumPayloadSchema from "./schema.js";

export default {
  validate: async (payload: Request["payload"]) => {
    try {
      await albumPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
