import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import songPayloadSchema from "./schema.js";

export default {
  validate: async (payload: Request["payload"]): Promise<void> => {
    try {
      await songPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
