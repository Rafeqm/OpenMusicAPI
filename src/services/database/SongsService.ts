/* eslint-disable no-undef */

import { badData, notFound } from "@hapi/boom";
import {
  FavoriteSong,
  Playlist,
  Prisma,
  PrismaClient,
  Song,
} from "@prisma/client";
import { nanoid } from "nanoid";

import CacheService from "../cache/CacheService";

export type SongsData = Array<Pick<Song, "id" | "title" | "performer">>;

export default class SongsService {
  private readonly _prisma: PrismaClient;

  constructor(private readonly _cacheService: CacheService) {
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

      await this._cacheService.delete("songs");

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
  ): Promise<DataSource<SongsData>> {
    const cachedSongs = await this._cacheService.get("songs");

    if (cachedSongs !== null) {
      return {
        songs: this._filterSongs(JSON.parse(cachedSongs), { title, performer }),
        source: "cache",
      };
    }

    const songs = await this._prisma.song.findMany({
      select: {
        id: true,
        title: true,
        performer: true,
      },
    });

    await this._cacheService.set("songs", JSON.stringify(songs));

    return {
      songs: this._filterSongs(songs, { title, performer }),
      source: "database",
    };
  }

  private _filterSongs(
    songs: SongsData,
    filter: {
      title: Song["title"];
      performer: Song["performer"];
    }
  ): any {
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(filter.title.toLowerCase()) &&
        song.performer.toLowerCase().includes(filter.performer.toLowerCase())
    );
  }

  async getSongById(
    id: Song["id"]
  ): Promise<DataSource<Omit<Song, "audioFileExt">>> {
    const cachedSong = await this._cacheService.get(`songs:${id}`);

    if (cachedSong !== null) {
      return {
        song: JSON.parse(cachedSong),
        source: "cache",
      };
    }

    try {
      const song = await this._prisma.song.findUniqueOrThrow({
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

      await this._cacheService.set(`songs:${id}`, JSON.stringify(song));

      return {
        song,
        source: "database",
      };
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

      await this._cacheService.delete("songs");
      await this._cacheService.delete(`songs:${id}`);
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

      await this._cacheService.delete("songs");
      await this._cacheService.delete(`songs:${id}`);
      await this._cacheService.delete(`songs:${id}:audio`);
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

      await this._cacheService.delete(`songs:${id}`);
      await this._cacheService.delete(`songs:${id}:audio`);
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

  async getSongAudioById(id: Song["id"]): Promise<DataSource<string>> {
    const cachedFilename = await this._cacheService.get(`songs:${id}:audio`);

    if (cachedFilename !== null) {
      return {
        filename: cachedFilename,
        source: "cache",
      };
    }

    try {
      const song = await this._prisma.song.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          audioFileExt: true,
        },
      });

      const filename = id + song.audioFileExt;
      await this._cacheService.set(`songs:${id}:audio`, filename);

      return {
        filename,
        source: "database",
      };
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

  async getSongLikesById(id: FavoriteSong["songId"]): Promise<number> {
    try {
      return await this._prisma.favoriteSong.count({
        where: {
          songId: id,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw notFound("Song not found");
        }
      }

      throw error;
    }
  }
}
