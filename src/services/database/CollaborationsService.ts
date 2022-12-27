import { badData, badRequest, notFound } from "@hapi/boom";
import { Collaboration, Prisma, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default class CollaborationsService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async addCollaboration(input: Collaboration): Promise<Collaboration["id"]> {
    try {
      const collaboration = await this._prisma.collaboration.create({
        data: {
          ...input,
          id: nanoid(),
        },
      });

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

  async deleteCollaboration(
    playlist: Collaboration["playlistId"],
    user: Collaboration["userId"]
  ): Promise<void> {
    try {
      await this._prisma.collaboration.delete({
        where: {
          playlistId_userId: {
            playlistId: playlist,
            userId: user,
          },
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
