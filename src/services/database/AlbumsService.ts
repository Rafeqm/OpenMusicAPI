import { badData, notFound } from "@hapi/boom";
import { Album, PrismaClient } from "@prisma/client";
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
        select: {
          id: true,
        },
      });

      return album.id;
    } catch (error) {
      throw badData("Invalid input data. Failed to add album.");
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
    await this.getAlbumById(id);

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
      throw badData("Invalid input data. Failed to update album.");
    }
  }

  async deleteAlbumById(id: string): Promise<void> {
    await this.getAlbumById(id);

    await this._prisma.album.delete({
      where: {
        id,
      },
    });
  }
}
