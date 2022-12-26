import { Lifecycle } from "@hapi/hapi";

export default class CollaborationsHandler {
  httpRequestHandler: Lifecycle.Method = (request) =>
    `You requested a ${request.method.toUpperCase()} action to ${request.url}`;
}
