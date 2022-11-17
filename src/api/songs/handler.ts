import { Lifecycle } from "@hapi/hapi";

import SongsService from "../../services/database/SongsService";
import SongsPayloadValidator from "../../validator/songs";

export default class SongsHandler {
  constructor(
    private readonly service: SongsService,
    private readonly validator: typeof SongsPayloadValidator
  ) {}

  httpRequestHandler: Lifecycle.Method = (request) =>
    `You requested a ${request.method.toUpperCase()} action to ${request.url}`;
}
