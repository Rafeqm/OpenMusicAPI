import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import exportsSchema from "./schema.js";

export default {
  validate: async (payload: Request["payload"]) => {
    try {
      await exportsSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
