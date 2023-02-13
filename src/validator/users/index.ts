import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import { postUserPayloadSchema, putUserPayloadSchema } from "./schema.js";

export default {
  validatePostUserPayload: async (payload: Request["payload"]) => {
    try {
      await postUserPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },

  validatePutUserPayload: async (payload: Request["payload"]) => {
    try {
      await putUserPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
