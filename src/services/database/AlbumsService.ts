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

  async addAlbum(name: string, year: number): Promise<string> {
    try {
      const album = await this._prisma.album.create({
        data: {
          id: nanoid(),
          name,
          year,
        },
      });

      return album.id;
    } catch (error) {
      throw badData("Data could not be processed. Failed to add album.");
    }
  }

  async getAlbumById(id: string): Promise<Album> {
    try {
      return await this._prisma.album.findUniqueOrThrow({
        where: {
          id,
        },
      });
    } catch (error) {
      throw notFound("Album not found.");
    }
  }

  async editAlbumById(id: string, name: string, year: number): Promise<void> {
    try {
      await this._prisma.album.update({
        where: {
          id,
        },
        data: {
          name,
          year,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientValidationError) {
        throw badData("Data could not be processed. Failed to update album.");
      }

      throw notFound("Album not found. Failed to update album.");
    }
  }

  async deleteAlbumById(id: string): Promise<void> {
    try {
      await this._prisma.album.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw notFound("Album not found. Failed to delete album.");
    }
  }
}
