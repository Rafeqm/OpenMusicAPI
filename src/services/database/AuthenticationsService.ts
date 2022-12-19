import { badRequest } from "@hapi/boom";
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

  async verifyRefreshToken(token: Authentication["token"]): Promise<void> {
    try {
      await this._prisma.authentication.findUniqueOrThrow({
        where: {
          token,
        },
      });
    } catch (error) {
      throw badRequest("Invalid refresh token");
    }
  }

  async deleteRefreshToken(token: Authentication["token"]) {
    try {
      await this._prisma.authentication.delete({
        where: {
          token,
        },
      });
    } catch (error) {
      throw badRequest("Invalid refresh token");
    }
  }
}
