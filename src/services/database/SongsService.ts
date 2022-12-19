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

  async addSong(input: Song): Promise<Song["id"]> {
    try {
      const song = await this._prisma.song.create({
        data: {
          ...input,
          id: nanoid(),
        },
      });

      return song.id;
    } catch (error) {
      throw badData("Data unprocessable");
    }
  }

  async getSongs(
    title?: Song["title"],
    performer?: Song["performer"]
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

  async getSongById(id: Song["id"]): Promise<Song> {
    try {
      return await this._prisma.song.findUniqueOrThrow({
        where: {
          id,
        },
      });
    } catch (error) {
      throw notFound("Song not found");
    }
  }

  async editSongById(id: Song["id"], input: Song): Promise<void> {
    try {
      await this._prisma.song.update({
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

      throw notFound("Song not found");
    }
  }

  async deleteSongById(id: Song["id"]): Promise<void> {
    try {
      await this._prisma.song.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw notFound("Song not found");
    }
  }
}
