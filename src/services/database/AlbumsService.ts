import { badData, notFound } from "@hapi/boom";
import { Album, PrismaClient } from "@prisma/client";
import { PrismaClientValidationError } from "@prisma/client/runtime/index.js";
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
      throw badData("Data unprocessable");
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
      throw notFound("Album not found");
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
      if (error instanceof PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw notFound("Album not found");
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
      throw notFound("Album not found");
    }
  }
}
