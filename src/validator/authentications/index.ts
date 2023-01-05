import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import authenticationPayloadSchema from "./schema.js";

export default {
  validate: async (
    payload: Request["payload"],
    httpMethod: "POST" | "PUT" | "DELETE"
  ): Promise<void> => {
    try {
      await authenticationPayloadSchema[httpMethod].validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
