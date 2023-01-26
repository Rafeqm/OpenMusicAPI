import { badData, badRequest, notFound } from "@hapi/boom";
import { Collaboration, Prisma, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

import CacheService from "../cache/CacheService";

export default class CollaborationsService {
  private readonly _prisma: PrismaClient;

  constructor(private readonly _cacheService: CacheService) {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async addCollaboration(data: Collaboration): Promise<Collaboration["id"]> {
    try {
      const collaboration = await this._prisma.collaboration.create({
        data: {
          ...data,
          id: nanoid(),
        },
      });

      await this._cacheService.delete(
        `users:${collaboration.userId}:playlists`
      );

      return collaboration.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw notFound("Playlist or user not found");
        }
      }

      throw error;
    }
  }

  async deleteCollaboration(data: Collaboration) {
    try {
      const collaboration = await this._prisma.collaboration.delete({
        where: {
          playlistId_userId: data,
        },
      });

      await this._cacheService.delete(
        `users:${collaboration.userId}:playlists`
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw badRequest("Unverified collaboration");
        }
      }

      throw error;
    }
  }

  async verifyCollaborator(data: Omit<Collaboration, "id">) {
    try {
      await this._prisma.collaboration.findUniqueOrThrow({
        where: {
          playlistId_userId: data,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw badRequest("Unverified collaboration");
        }
      }

      throw error;
    }
  }
}
