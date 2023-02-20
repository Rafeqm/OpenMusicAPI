/* eslint-disable no-undef */

import { badData, badRequest, notFound, unauthorized } from "@hapi/boom";
import { Prisma, PrismaClient, Social, User } from "@prisma/client";
import bcrypt from "bcrypt";

import CacheService from "../cache/CacheService";

type UserData = Omit<User, "password" | "avatarFileExt">;

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
        avatarUrl: true,
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
          avatarUrl: true,
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

  async editUserById(id: User["id"], data: User) {
    try {
      await this._prisma.user.update({
        where: {
          id,
        },
        data,
      });

      await this._cacheService.delete("users");
      await this._cacheService.delete(`users:${id}`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw unauthorized("Unauthorized action");
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
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

  async updateUserAvatarById(
    id: User["id"],
    avatarUrl: User["avatarUrl"],
    fileExt: User["avatarFileExt"]
  ) {
    try {
      await this._prisma.user.update({
        where: {
          id,
        },
        data: {
          avatarUrl,
          avatarFileExt: fileExt,
        },
      });

      await this._cacheService.delete("users");
      await this._cacheService.delete(`users:${id}`);
      await this._cacheService.delete(`users:${id}:avatar`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("User not found");
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
    }
  }

  async getUserAvatarById(id: User["id"]): Promise<string> {
    const cachedFilename = await this._cacheService.get(`users:${id}:avatar`);

    if (cachedFilename !== null) {
      return cachedFilename;
    }

    try {
      const user = await this._prisma.user.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          avatarFileExt: true,
        },
      });

      const filename = id + user.avatarFileExt;
      await this._cacheService.set(`users:${id}:avatar`, filename);

      return filename;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("User not found");
        }
      }

      throw error;
    }
  }

  async deleteUserAvatarById(id: User["id"]): Promise<string> {
    try {
      const filename = await this.getUserAvatarById(id);
      await this._prisma.user.update({
        where: {
          id,
        },
        data: {
          avatarUrl: null,
          avatarFileExt: null,
        },
      });

      return filename;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("User not found");
        }
      }

      throw error;
    }
  }

  async updateUserFollowersById(data: Social) {
    try {
      await this._prisma.social.create({ data });
      await this._cacheService.delete(`users:${data.followeeId}:followers`);
      await this._cacheService.delete(`users:${data.followerId}:following`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          await this._prisma.social.delete({
            where: {
              followerId_followeeId: data,
            },
          });
          await this._cacheService.delete(`users:${data.followeeId}:followers`);
          await this._cacheService.delete(`users:${data.followerId}:following`);

          return;
        }

        if (error.code === "P2003") {
          throw notFound("User not found");
        }
      }

      throw error;
    }
  }

  async getUserFollowersById(
    id: Social["followeeId"]
  ): Promise<DataSource<UsersData>> {
    await this._assertUserExistsById(id);

    const cachedFollowers = await this._cacheService.get(
      `users:${id}:followers`
    );

    if (cachedFollowers !== null) {
      return {
        followers: JSON.parse(cachedFollowers),
        source: "cache",
      };
    }

    const followers: UsersData = await this._prisma.$queryRaw`
      SELECT
        users.id,
        users.username,
        users.fullname,
        users.avatar_url AS "avatarUrl"
      FROM users
      LEFT JOIN socials ON users.id = socials.follower_id
      WHERE socials.followee_id = ${id}`;

    await this._cacheService.set(
      `users:${id}:followers`,
      JSON.stringify(followers)
    );

    return {
      followers,
      source: "database",
    };
  }

  async getUserFollowingById(
    id: Social["followerId"]
  ): Promise<DataSource<UsersData>> {
    await this._assertUserExistsById(id);

    const cachedFollowing = await this._cacheService.get(
      `users:${id}:following`
    );

    if (cachedFollowing !== null) {
      return {
        following: JSON.parse(cachedFollowing),
        source: "cache",
      };
    }

    const following: UsersData = await this._prisma.$queryRaw`
      SELECT
        users.id,
        users.username,
        users.fullname,
        users.avatar_url AS "avatarUrl"
      FROM users
      LEFT JOIN socials ON users.id = socials.followee_id
      WHERE socials.follower_id = ${id}`;

    await this._cacheService.set(
      `users:${id}:following`,
      JSON.stringify(following)
    );

    return {
      following,
      source: "database",
    };
  }

  private async _assertUserExistsById(id: User["id"]) {
    try {
      await this._prisma.user.findUniqueOrThrow({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("User not found");
        }
      }

      throw error;
    }
  }
}
