import { badData } from "@hapi/boom";
import { PrismaClient } from "@prisma/client";
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
}
