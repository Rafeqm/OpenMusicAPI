import { badData, badRequest } from "@hapi/boom";
import { PrismaClient, User } from "@prisma/client";
import { PrismaClientValidationError } from "@prisma/client/runtime/index.js";
import { nanoid } from "nanoid";

export default class UsersService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async addUser(input: User): Promise<User["id"]> {
    try {
      const user = await this._prisma.user.create({
        data: {
          ...input,
          id: nanoid(),
        },
      });

      return user.id;
    } catch (error) {
      if (error instanceof PrismaClientValidationError) {
        throw badData("Data could not be processed. Failed to add user.");
      }

      throw badRequest("Username already exists. Failed to add user.");
    }
  }
}
