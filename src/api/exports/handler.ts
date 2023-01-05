import { Lifecycle } from "@hapi/hapi";

export default class ExportsHandler {
  httpRequestHandler: Lifecycle.Method = (request) =>
    `You requested a ${request.method.toUpperCase()} action to ${request.url}`;
}
