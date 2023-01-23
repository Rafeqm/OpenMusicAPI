import { badData, notFound } from "@hapi/boom";
import {
  FavoriteSong,
  Playlist,
  Prisma,
  PrismaClient,
  Song,
} from "@prisma/client";
import { nanoid } from "nanoid";

export type SongsData = Array<Pick<Song, "id" | "title" | "performer">>;

export default class SongsService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async addSong(data: Song): Promise<Song["id"]> {
    try {
      const song = await this._prisma.song.create({
        data: {
          ...data,
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
    title: Song["title"] = "",
    performer: Song["performer"] = ""
  ): Promise<SongsData> {
    return await this._prisma.song.findMany({
      where: {
        title: {
          contains: title,
          mode: "insensitive",
        },
        performer: {
          contains: performer,
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

  async getSongById(id: Song["id"]): Promise<Omit<Song, "audioFileExt">> {
    try {
      return await this._prisma.song.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          id: true,
          title: true,
          year: true,
          performer: true,
          genre: true,
          duration: true,
          albumId: true,
          audioUrl: true,
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

  async getSongsByPlaylistId(id: Playlist["id"]): Promise<SongsData> {
    return await this._prisma.song.findMany({
      where: {
        playlists: {
          some: {
            id,
          },
        },
      },
      select: {
        id: true,
        title: true,
        performer: true,
      },
    });
  }

  async editSongById(id: Song["id"], data: Song) {
    try {
      await this._prisma.song.update({
        where: {
          id,
        },
        data,
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

  async deleteSongById(id: Song["id"]) {
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

  async updateSongAudioById(
    id: Song["id"],
    audioUrl: Song["audioUrl"] = null,
    fileExt: Song["audioFileExt"] = null
  ) {
    try {
      await this._prisma.song.update({
        where: {
          id,
        },
        data: {
          audioUrl,
          audioFileExt: fileExt,
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

  async getSongAudioById(id: Song["id"]): Promise<string> {
    try {
      const song = await this._prisma.song.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          audioFileExt: true,
        },
      });

      return id + song.audioFileExt;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Song not found");
        }
      }

      throw error;
    }
  }

  async updateSongLikesById(data: FavoriteSong) {
    try {
      await this._prisma.favoriteSong.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          await this._prisma.favoriteSong.delete({
            where: {
              userId_songId: data,
            },
          });

          return;
        }

        if (error.code === "P2003") {
          throw notFound("Song not found");
        }
      }

      throw error;
    }
  }
}
