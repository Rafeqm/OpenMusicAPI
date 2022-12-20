import { badRequest } from "@hapi/boom";
import { Authentication, Prisma, PrismaClient } from "@prisma/client";

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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw badRequest("Invalid refresh token");
        }
      }

      throw error;
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw badRequest("Invalid refresh token");
        }
      }

      throw error;
    }
  }
}
