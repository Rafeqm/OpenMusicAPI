/* eslint-disable no-undef */

import { badData, forbidden, isBoom, notFound } from "@hapi/boom";
import {
  ActivityOnPlaylist,
  Playlist,
  Prisma,
  PrismaClient,
  Song,
  User,
} from "@prisma/client";

import CacheService from "../cache/CacheService";
import CollaborationsService from "./CollaborationsService";
import SongsService, { SongsData } from "./SongsService";

export type PlaylistData = Omit<Playlist, "ownerId"> &
  Pick<User, "username"> & { songs?: SongsData };

export type PlaylistsData = Array<PlaylistData>;

type PlaylistsFilter = Pick<Playlist, "name">;

type ActionOnPlaylist = "add" | "delete";

type ActivitiesOnPlaylist = Array<{
  username: User["username"];
  title: Song["title"];
  action: ActionOnPlaylist;
  time: ActivityOnPlaylist["time"];
}>;

export default class PlaylistsService {
  private readonly _prisma: PrismaClient;

  constructor(
    private readonly _songsService: SongsService,
    private readonly _collaborationsService: CollaborationsService,
    private readonly _cacheService: CacheService
  ) {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async addPlaylist(data: Playlist): Promise<Playlist["id"]> {
    try {
      const playlist = await this._prisma.playlist.create({
        data,
      });

      await this._cacheService.delete(`users:${playlist.ownerId}:playlists`);

      return playlist.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
    }
  }

  async getPlaylists(
    userId: User["id"],
    name: Playlist["name"] = ""
  ): Promise<DataSource<PlaylistsData>> {
    const cachedPlaylists = await this._cacheService.get(
      `users:${userId}:playlists`
    );

    if (cachedPlaylists !== null) {
      return {
        playlists: this._filterPlaylists(JSON.parse(cachedPlaylists), { name }),
        source: "cache",
      };
    }

    const playlists = await this._prisma.$queryRaw<PlaylistsData>`
      SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON playlists.owner = users.id
      LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
      WHERE playlists.owner = ${userId} OR collaborations.user_id = ${userId}`;

    await this._cacheService.set(
      `users:${userId}:playlists`,
      JSON.stringify(playlists)
    );

    return {
      playlists: this._filterPlaylists(playlists, { name }),
      source: "database",
    };
  }

  private _filterPlaylists(
    playlists: PlaylistsData,
    filter: PlaylistsFilter
  ): PlaylistsData {
    return playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(filter.name.toLowerCase())
    );
  }

  async editPlaylistById(id: Playlist["id"], data: Playlist) {
    try {
      const playlist = await this._prisma.playlist.update({
        where: {
          id,
        },
        data,
      });

      await this._cacheService.delete(`users:${playlist.ownerId}:playlists`);
      await this._cacheService.delete(`playlists:${id}`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Playlist not found");
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
    }
  }

  async deletePlaylistById(id: Playlist["id"]) {
    try {
      const playlist = await this._prisma.playlist.delete({
        where: {
          id,
        },
      });

      await this._cacheService.delete(`users:${playlist.ownerId}:playlists`);
      await this._cacheService.delete(`playlists:${id}`);
      await this._cacheService.delete(`playlists:${id}:activities`);
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
    playlistId: Playlist["id"],
    songId: Song["id"],
    userId: User["id"]
  ) {
    try {
      await this._prisma.playlist.update({
        where: {
          id: playlistId,
        },
        data: {
          songs: {
            connect: {
              id: songId,
            },
          },
          activities: {
            create: {
              userId,
              songId,
              action: <ActionOnPlaylist>"add",
            },
          },
        },
      });

      await this._cacheService.delete(`playlists:${playlistId}`);
      await this._cacheService.delete(`playlists:${playlistId}:activities`);
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

  async getSongsInPlaylistByPlaylistId(
    id: Playlist["id"]
  ): Promise<DataSource<PlaylistData>> {
    const cachedPlaylist = await this._cacheService.get(`playlists:${id}`);

    if (cachedPlaylist !== null) {
      const playlist = JSON.parse(cachedPlaylist);
      playlist.songs = await this._songsService.getSongsByPlaylistId(id);

      return {
        playlist,
        source: "cache",
      };
    }

    const playlist = (
      await this._prisma.$queryRaw<Array<PlaylistData>>`
        SELECT playlists.id, playlists.name, users.username FROM playlists
        LEFT JOIN users ON playlists.owner = users.id
        WHERE playlists.id = ${id}`
    )[0];

    if (playlist === undefined) throw notFound("Playlist not found");

    await this._cacheService.set(`playlists:${id}`, JSON.stringify(playlist));

    playlist.songs = await this._songsService.getSongsByPlaylistId(id);

    return {
      playlist,
      source: "database",
    };
  }

  async deleteSongFromPlaylistById(
    playlistId: Playlist["id"],
    songId: Song["id"],
    userId: User["id"]
  ) {
    try {
      await this._prisma.playlist.update({
        where: {
          id: playlistId,
        },
        data: {
          songs: {
            disconnect: {
              id: songId,
            },
          },
          activities: {
            create: {
              userId,
              songId,
              action: <ActionOnPlaylist>"delete",
            },
          },
        },
      });

      await this._cacheService.delete(`playlists:${playlistId}`);
      await this._cacheService.delete(`playlists:${playlistId}:activities`);
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

  async getActivitiesOnPlaylistById(
    id: Playlist["id"]
  ): Promise<DataSource<ActivitiesOnPlaylist>> {
    const cachedActivities = await this._cacheService.get(
      `playlists:${id}:activities`
    );

    if (cachedActivities !== null) {
      return {
        activities: JSON.parse(cachedActivities),
        source: "cache",
      };
    }

    const activities = await this._prisma.$queryRaw<ActivitiesOnPlaylist>`
      SELECT
        users.username,
        songs.title,
        activities_on_playlist.action,
        activities_on_playlist.time
      FROM activities_on_playlist
      LEFT JOIN users ON activities_on_playlist.user_id = users.id
      LEFT JOIN songs ON activities_on_playlist.song_id = songs.id
      WHERE activities_on_playlist.playlist_id = ${id}
      ORDER BY activities_on_playlist.time`;

    await this._cacheService.set(
      `playlists:${id}:activities`,
      JSON.stringify(activities)
    );

    return {
      activities,
      source: "database",
    };
  }

  async verifyPlaylistOwner(
    playlistId: Playlist["id"],
    userId: Playlist["ownerId"]
  ) {
    try {
      const playlist = await this._prisma.playlist.findUniqueOrThrow({
        where: {
          id: playlistId,
        },
      });

      if (userId !== playlist.ownerId) throw forbidden("Access not granted");
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Playlist not found");
        }
      }

      throw error;
    }
  }

  async verifyPlaylistAccess(
    playlistId: Playlist["id"],
    userId: Playlist["ownerId"]
  ) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (!isBoom(error) || error.output.statusCode === 404) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator({
          playlistId,
          userId,
        });
      } catch {
        throw error;
      }
    }
  }

  async verifyPlaylistPrivacy(
    playlistId: Playlist["id"],
    userId: Playlist["ownerId"]
  ) {
    try {
      await this.verifyPlaylistAccess(playlistId, userId);
    } catch (error) {
      if (!isBoom(error) || error.output.statusCode === 404) {
        throw error;
      }

      const playlist = await this._prisma.playlist.findUniqueOrThrow({
        where: {
          id: playlistId,
        },
      });

      if (playlist.private) throw error;
    }
  }
}
