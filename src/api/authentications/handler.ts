import { Lifecycle } from "@hapi/hapi";

import AuthenticationsService from "../../services/database/AuthenticationsService";
import UsersService from "../../services/database/UsersService";
import authenticationsPayloadValidator from "../../validator/authentications";

export default class AuthenticationsHandler {
  constructor(
    private readonly _authenticationsService: AuthenticationsService,
    private readonly _usersService: UsersService,
    private readonly _validator: typeof authenticationsPayloadValidator
  ) {}

  httpRequestHandler: Lifecycle.Method = (request) =>
    `You requested a ${request.method.toUpperCase()} action to ${request.url}`;
}
