import { badData, notFound } from "@hapi/boom";
import { PrismaClient, Song } from "@prisma/client";
import { PrismaClientValidationError } from "@prisma/client/runtime/index.js";
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
      });

      return song.id;
    } catch (error) {
      throw badData("Data could not be processed. Failed to add song.");
    }
  }

  async getSongs(
    title?: string,
    performer?: string
  ): Promise<Array<Pick<Song, "id" | "title" | "performer">>> {
    return await this._prisma.song.findMany({
      where: {
        title: {
          contains: title ?? "",
          mode: "insensitive",
        },
        performer: {
          contains: performer ?? "",
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        title: true,
        performer: true,
      },
    });
  }

  async getSongById(id: string): Promise<Song> {
    try {
      return await this._prisma.song.findUniqueOrThrow({
        where: {
          id,
        },
      });
    } catch (error) {
      throw notFound("Song not found.");
    }
  }

  async editSongById(
    id: string,
    title: string,
    year: number,
    performer: string,
    genre: string,
    duration: number | null,
    albumId: string | null
  ): Promise<void> {
    try {
      await this._prisma.song.update({
        where: {
          id,
        },
        data: {
          title,
          year,
          performer,
          genre,
          duration,
          albumId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientValidationError) {
        throw badData("Data could not be processed. Failed to update song.");
      }

      throw notFound("Song not found. Failed to update song.");
    }
  }

  async deleteSongById(id: string): Promise<void> {
    try {
      await this._prisma.song.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw notFound("Song not found. Failed to delete song.");
    }
  }
}
