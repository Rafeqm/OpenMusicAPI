import { badData, badRequest, unauthorized } from "@hapi/boom";
import { Prisma, PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";

export default class UsersService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async addUser(data: User): Promise<User["id"]> {
    try {
      const user = await this._prisma.user.create({
        data: {
          ...data,
          password: await bcrypt.hash(data.password, 10),
        },
      });

      return user.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw badRequest("Username already exists");
        }
      }

      throw error;
    }
  }

  async getUsers(
    username: User["username"] = "",
    fullname: User["fullname"] = ""
  ): Promise<Array<Omit<User, "password">>> {
    return await this._prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: "insensitive",
        },
        fullname: {
          contains: fullname,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        username: true,
        fullname: true,
      },
    });
  }

  async verifyUserCredential(
    username: User["username"],
    password: User["password"]
  ): Promise<User["id"]> {
    try {
      const user = await this._prisma.user.findUniqueOrThrow({
        where: {
          username,
        },
      });

      const passwordIsCorrect = await bcrypt.compare(password, user.password);
      if (!passwordIsCorrect) throw unauthorized("Incorrect password");

      return user.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw unauthorized("Incorrect username");
        }
      }

      throw error;
    }
  }
}
