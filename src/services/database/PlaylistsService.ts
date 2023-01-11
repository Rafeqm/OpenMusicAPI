import { badData, forbidden, isBoom, notFound } from "@hapi/boom";
import {
  ActivityOnPlaylist,
  Playlist,
  Prisma,
  PrismaClient,
  Song,
  User,
} from "@prisma/client";
import { nanoid } from "nanoid";

import CollaborationsService from "./CollaborationsService";
import SongsService, { SongsData } from "./SongsService";

type PlaylistData = Omit<Playlist, "ownerId"> &
  Pick<User, "username"> & { songs?: SongsData };

type ActionOnPlaylist = "add" | "delete";

type ActivityData = {
  username: User["username"];
  title: Song["title"];
  action: ActionOnPlaylist;
  time: ActivityOnPlaylist["time"];
};

export default class PlaylistsService {
  private readonly _prisma: PrismaClient;

  constructor(
    private readonly _songsService: SongsService,
    private readonly _collaborationsService: CollaborationsService
  ) {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async addPlaylist(data: Playlist): Promise<Playlist["id"]> {
    try {
      const playlist = await this._prisma.playlist.create({
        data: {
          ...data,
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

  async getPlaylists(user: User["id"]): Promise<Array<PlaylistData>> {
    return await this._prisma.$queryRaw`
      SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON playlists.owner = users.id
      LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
      WHERE playlists.owner = ${user} OR collaborations.user_id = ${user}`;
  }

  async deletePlaylistById(id: Playlist["id"]) {
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
    song: Song["id"],
    user: User["id"]
  ) {
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
          activities: {
            create: {
              userId: user,
              songId: song,
              action: <ActionOnPlaylist>"add",
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

  async getSongsInPlaylistByPlaylistId(
    id: Playlist["id"]
  ): Promise<PlaylistData> {
    const playlist = (
      await this._prisma.$queryRaw<Array<PlaylistData>>`
        SELECT playlists.id, playlists.name, users.username FROM playlists
        LEFT JOIN users ON playlists.owner = users.id
        WHERE playlists.id = ${id}`
    )[0];

    if (playlist === undefined) throw notFound("Playlist not found");

    playlist.songs = await this._songsService.getSongsByPlaylistId(id);

    return playlist;
  }

  async deleteSongFromPlaylistById(
    id: Playlist["id"],
    song: Song["id"],
    user: User["id"]
  ) {
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
          activities: {
            create: {
              userId: user,
              songId: song,
              action: <ActionOnPlaylist>"delete",
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

  async getActivitiesOnPlaylistById(
    id: Playlist["id"]
  ): Promise<Array<ActivityData>> {
    return await this._prisma.$queryRaw`
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
}
