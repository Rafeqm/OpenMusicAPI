import { Authentication, PrismaClient } from "@prisma/client";

export default class AuthenticationsService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async addRefreshToken(token: Authentication["token"]): Promise<void> {
    await this._prisma.authentication.create({
      data: {
        token,
      },
    });
  }
}
