import { Plugin } from "@hapi/hapi";

import UsersHandler from "./handler.js";
import routes from "./routes.js";

export default <Plugin<null>>{
  name: "users",
  version: "0.0.1",
  // eslint-disable-next-line require-await
  register: async (server) => {
    const usersHandler = new UsersHandler();
    server.route(routes(usersHandler));
  },
};
