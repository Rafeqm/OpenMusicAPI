import { Lifecycle } from "@hapi/hapi";

import UsersService from "../../services/database/UsersService";
import usersPayloadValidator from "../../validator/users";

export default class UsersHandler {
  constructor(
    private readonly _service: UsersService,
    private readonly _validator: typeof usersPayloadValidator
  ) {}

  httpRequestHandler: Lifecycle.Method = (request) =>
    `You requested a ${request.method.toUpperCase()} action to ${request.url}`;
}
