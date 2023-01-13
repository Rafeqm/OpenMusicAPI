import { badRequest } from "@hapi/boom";
import { Request } from "@hapi/hapi";

import uploadFileHeadersSchema from "./schema.js";

export default {
  validate: async (
    headers: Request["headers"],
    fileType: keyof typeof uploadFileHeadersSchema
  ) => {
    try {
      await uploadFileHeadersSchema[fileType].validateAsync(headers);
    } catch (error) {
      throw badRequest((<Error>error).message);
    }
  },
};
