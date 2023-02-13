/* eslint-disable no-undef */

import { badData, badRequest, notFound, unauthorized } from "@hapi/boom";
import { Prisma, PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";

import CacheService from "../cache/CacheService";

type UserData = Omit<User, "password">;

type UsersData = Array<UserData>;

type UsersFilter = Pick<User, "username" | "fullname">;

export default class UsersService {
  private readonly _prisma: PrismaClient;

  constructor(private readonly _cacheService: CacheService) {
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

      await this._cacheService.delete("users");

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
  ): Promise<DataSource<UsersData>> {
    const cachedUsers = await this._cacheService.get("users");

    if (cachedUsers !== null) {
      return {
        users: this._filterUsers(JSON.parse(cachedUsers), {
          username,
          fullname,
        }),
        source: "cache",
      };
    }

    const users = await this._prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullname: true,
      },
    });

    await this._cacheService.set("users", JSON.stringify(users));

    return {
      users: this._filterUsers(users, { username, fullname }),
      source: "database",
    };
  }

  private _filterUsers(users: UsersData, filter: UsersFilter): UsersData {
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(filter.username.toLowerCase()) &&
        user.fullname.toLowerCase().includes(filter.fullname.toLowerCase())
    );
  }

  async getUserById(id: User["id"]): Promise<DataSource<UserData>> {
    const cachedUser = await this._cacheService.get(`users:${id}`);

    if (cachedUser !== null) {
      return {
        user: JSON.parse(cachedUser),
        source: "cache",
      };
    }

    try {
      const user = await this._prisma.user.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          id: true,
          username: true,
          fullname: true,
          playlists: {
            where: {
              private: false,
            },
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      await this._cacheService.set(`users:${id}`, JSON.stringify(user));

      return {
        user,
        source: "database",
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("User not found");
        }
      }

      throw error;
    }
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
