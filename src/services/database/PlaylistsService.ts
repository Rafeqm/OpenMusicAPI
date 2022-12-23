import { badData, forbidden, notFound } from "@hapi/boom";
import { Playlist, Prisma, PrismaClient, Song, User } from "@prisma/client";
import { nanoid } from "nanoid";

import SongsService, { SongsData } from "./SongsService";

type PlaylistData = Omit<Playlist, "ownerId"> &
  Pick<User, "username"> & {
    songs?: SongsData;
  };

export default class PlaylistsService {
  private readonly _prisma: PrismaClient;

  constructor(private readonly _songsService: SongsService) {
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

  async getPlaylists(owner: Playlist["ownerId"]): Promise<Array<PlaylistData>> {
    return await this._prisma.$queryRaw`
      SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON playlists.owner = users.id
      WHERE playlists.owner = ${owner} OR users.id = ${owner}`;
  }

  async deletePlaylistById(id: Playlist["id"]): Promise<void> {
    try {
      await this._prisma.playlist.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Playlist not found");
        }
      }

      throw error;
    }
  }

  async addSongToPlaylistById(
    id: Playlist["id"],
    song: Song["id"]
  ): Promise<void> {
    try {
      await this._prisma.playlist.update({
        where: {
          id,
        },
        data: {
          songs: {
            connect: {
              id: song,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Playlist or song not found");
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
    }
  }

  async getSongsInPlaylistById(id: Playlist["id"]): Promise<PlaylistData> {
    const playlist = (
      await this._prisma.$queryRaw<Array<PlaylistData>>`
        SELECT playlists.id, playlists.name, users.username FROM playlists
        LEFT JOIN users ON playlists.owner = users.id
        WHERE playlists.id = ${id}`
    )[0];

    if (playlist === undefined) throw notFound("Playlist not found");

    return {
      ...playlist,
      songs: await this._songsService.getSongsByPlaylistId(id),
    };
  }

  async deleteSongFromPlaylistById(
    id: Playlist["id"],
    song: Song["id"]
  ): Promise<void> {
    try {
      await this._prisma.playlist.update({
        where: {
          id,
        },
        data: {
          songs: {
            disconnect: {
              id: song,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Playlist or song not found");
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
    }
  }

  async verifyPlaylistOwner(
    id: Playlist["id"],
    owner: Playlist["ownerId"]
  ): Promise<void> {
    try {
      const playlist = await this._prisma.playlist.findUniqueOrThrow({
        where: {
          id,
        },
      });

      if (owner !== playlist.ownerId) throw forbidden("Access not granted");
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Playlist not found");
        }
      }

      throw error;
    }
  }
}
