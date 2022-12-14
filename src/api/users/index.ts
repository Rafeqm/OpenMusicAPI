import { Plugin } from "@hapi/hapi";

import UsersService from "../../services/database/UsersService";
import usersPayloadValidator from "../../validator/users";
import UsersHandler from "./handler.js";
import routes from "./routes.js";

type UsersPluginOptions = {
  service: UsersService;
  validator: typeof usersPayloadValidator;
};

export default <Plugin<UsersPluginOptions>>{
  name: "users",
  version: "1.0.0",
  // eslint-disable-next-line require-await
  register: async (server, { service, validator }) => {
    const usersHandler = new UsersHandler(service, validator);
    server.route(routes(usersHandler));
  },
};
