import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import exportSchema from "./schema.js";

export default {
  validate: async (payload: Request["payload"]) => {
    try {
      await exportSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
