import { Plugin } from "@hapi/hapi";

import UsersHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<Record<string, any>>>{
  name: "users",
  version: "1.3.0",
  // eslint-disable-next-line require-await
  register: async (server, { service, validator }) => {
    const usersHandler = new UsersHandler(service, validator);
    server.route(routes(usersHandler));
  },
};
