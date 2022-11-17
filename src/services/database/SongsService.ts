import { PrismaClient } from "@prisma/client";

export default class SongsService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }
}
