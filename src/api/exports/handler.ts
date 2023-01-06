import { Lifecycle } from "@hapi/hapi";

import exportsService from "../../services/message_queue/exportsService";
import exportsPayloadValidator from "../../validator/exports";

export default class ExportsHandler {
  constructor(
    private readonly _service: typeof exportsService,
    private readonly _validator: typeof exportsPayloadValidator
  ) {}

  httpRequestHandler: Lifecycle.Method = (request) =>
    `You requested a ${request.method.toUpperCase()} action to ${request.url}`;
}
