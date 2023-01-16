import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import { imageHeadersSchema } from "./schema.js";

export default {
  validateImageHeaders: async (headers: Request["headers"]) => {
    try {
      await imageHeadersSchema.validateAsync(headers);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
