import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import collaborationPayloadSchema from "./schema.js";

export default {
  validate: async (payload: Request["payload"]): Promise<void> => {
    try {
      await collaborationPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
