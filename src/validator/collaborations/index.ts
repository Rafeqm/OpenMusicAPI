import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import { collaborationPayloadSchema } from "./schema.js";

export default {
  validateCollaborationPayload: async (payload: Request["payload"]) => {
    try {
      await collaborationPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
