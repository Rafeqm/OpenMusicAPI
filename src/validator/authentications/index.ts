import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import authenticationPayloadSchema from "./schema.js";

export default {
  validate: async (
    method: "POST" | "PUT" | "DELETE",
    payload: Request["payload"]
  ): Promise<void> => {
    try {
      await authenticationPayloadSchema[method].validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
