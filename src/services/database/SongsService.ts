import { badData } from "@hapi/boom";
import { PrismaClient, Song } from "@prisma/client";
import { nanoid } from "nanoid";

export default class SongsService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async addSong(
    title: string,
    year: number,
    performer: string,
    genre: string,
    duration: number | null,
    albumId: string | null
  ): Promise<string> {
    try {
      const song = await this._prisma.song.create({
        data: {
          id: nanoid(),
          title,
          year,
          performer,
          genre,
          duration,
          albumId,
        },
        select: {
          id: true,
        },
      });

      return song.id;
    } catch (error) {
      throw badData("Data could not be processed. Failed to add song.");
    }
  }

  async getSongs(): Promise<Array<Pick<Song, "id" | "title" | "performer">>> {
    return await this._prisma.song.findMany({
      select: {
        id: true,
        title: true,
        performer: true,
      },
    });
  }
}
