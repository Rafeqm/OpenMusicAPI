import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import { exportPayloadSchema } from "./schema.js";

export default {
  validateExportPayload: async (payload: Request["payload"]) => {
    try {
      await exportPayloadSchema.validateAsync(payload);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
