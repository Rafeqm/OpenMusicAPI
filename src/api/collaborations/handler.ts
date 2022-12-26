import { Lifecycle } from "@hapi/hapi";

import CollaborationsService from "../../services/database/CollaborationsService";
import collaborationsPayloadValidator from "../../validator/collaborations";

export default class CollaborationsHandler {
  constructor(
    private readonly _service: CollaborationsService,
    private readonly _validator: typeof collaborationsPayloadValidator
  ) {}

  httpRequestHandler: Lifecycle.Method = (request) =>
    `You requested a ${request.method.toUpperCase()} action to ${request.url}`;
}
