import { badData, notFound } from "@hapi/boom";
import { Album, Prisma, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default class AlbumsService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async addAlbum(input: Album): Promise<Album["id"]> {
    try {
      const album = await this._prisma.album.create({
        data: {
          ...input,
          id: nanoid(),
        },
      });

      return album.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
    }
  }

  async getAlbumById(id: Album["id"]): Promise<Album> {
    try {
      return await this._prisma.album.findUniqueOrThrow({
        where: {
          id,
        },
        include: {
          songs: {
            select: {
              id: true,
              title: true,
              performer: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Album not found");
        }
      }

      throw error;
    }
  }

  async editAlbumById(id: Album["id"], input: Album): Promise<void> {
    try {
      await this._prisma.album.update({
        where: {
          id,
        },
        data: {
          ...input,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Album not found");
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
    }
  }

  async deleteAlbumById(id: Album["id"]): Promise<void> {
    try {
      await this._prisma.album.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Album not found");
        }
      }

      throw error;
    }
  }
}
