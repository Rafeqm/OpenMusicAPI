import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import {
  deleteAuthenticationPayloadSchema,
  postAuthenticationPayloadSchema,
  putAuthenticationPayloadSchema,
} from "./schema.js";

export default {
  validatePostAuthenticationPayload: async (payload: Request["payload"]) => {
    try {
      await postAuthenticationPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },

  validatePutAuthenticationPayload: async (payload: Request["payload"]) => {
    try {
      await putAuthenticationPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },

  validateDeleteAuthenticationPayload: async (payload: Request["payload"]) => {
    try {
      await deleteAuthenticationPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
