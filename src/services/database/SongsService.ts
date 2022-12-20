import { badData, notFound } from "@hapi/boom";
import { Prisma, PrismaClient, Song } from "@prisma/client";
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
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Song not found");
        }
      }

      throw error;
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Song not found");
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Song not found");
        }
      }

      throw error;
    }
  }
}
