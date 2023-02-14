import { Plugin } from "@hapi/hapi";

import UsersHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<Record<string, any>>>{
  name: "users",
  version: "1.4.0",
  // eslint-disable-next-line require-await
  register: async (
    server,
    { usersService, storageService, usersValidator, uploadsValidator }
  ) => {
    const usersHandler = new UsersHandler(
      usersService,
      storageService,
      usersValidator,
      uploadsValidator
    );

    server.route(routes(usersHandler));
  },
};
