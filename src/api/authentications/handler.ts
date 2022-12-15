import { Lifecycle } from "@hapi/hapi";

import AuthenticationsService from "../../services/database/AuthenticationsService";
import authenticationsPayloadValidator from "../../validator/authentications";

export default class AuthenticationsHandler {
  constructor(
    private readonly _service: AuthenticationsService,
    private readonly _validator: typeof authenticationsPayloadValidator
  ) {}

  httpRequestHandler: Lifecycle.Method = (request) =>
    `You requested a ${request.method.toUpperCase()} action to ${request.url}`;
}
