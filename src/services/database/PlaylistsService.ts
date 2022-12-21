import { badData } from "@hapi/boom";
import { Playlist, Prisma, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default class PlaylistsService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async addPlaylist(input: Playlist): Promise<Playlist["id"]> {
    try {
      const playlist = await this._prisma.playlist.create({
        data: {
          ...input,
          id: nanoid(),
        },
      });

      return playlist.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
    }
  }
}
