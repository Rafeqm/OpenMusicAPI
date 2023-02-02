import { Lifecycle } from "@hapi/hapi";
import { Playlist } from "@prisma/client";

import PlaylistsService from "../../services/database/PlaylistsService";
import playlistsValidator from "../../validator/playlists";

export default class PlaylistsHandler {
  constructor(
    private readonly _service: PlaylistsService,
    private readonly _validator: typeof playlistsValidator
  ) {}

  postPlaylist: Lifecycle.Method = async (request, h) => {
    await this._validator.validatePlaylistPayload(request.payload);

    const { userId } = <any>request.auth.credentials;
    const playlistId = await this._service.addPlaylist({
      ...(<Playlist>request.payload),
      ownerId: userId,
    });

    return h
      .response({
        status: "success",
        message: "Playlist added",
        data: {
          playlistId,
        },
      })
      .code(201);
  };

  getPlaylists: Lifecycle.Method = async (request, h) => {
    const { userId } = <any>request.auth.credentials;
    const { name } = <Playlist>request.query;
    const { playlists, source } = await this._service.getPlaylists(
      userId,
      name
    );

    return h
      .response({
        status: "success",
        data: {
          playlists,
        },
      })
      .header("X-Data-Source", source);
  };

  deletePlaylistById: Lifecycle.Method = async (request) => {
    const { id } = <Playlist>request.params;
    const { userId } = <any>request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, userId);
    await this._service.deletePlaylistById(id);

    return {
      status: "success",
      message: "Playlist deleted",
    };
  };

  postSongToPlaylistById: Lifecycle.Method = async (request, h) => {
    const { id } = <Playlist>request.params;
    const { userId } = <any>request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, userId);
    await this._validator.validateSongPayload(request.payload);

    const { songId } = <any>request.payload;
    await this._service.addSongToPlaylistById(id, songId, userId);

    return h
      .response({
        status: "success",
        message: "Song added to playlist",
      })
      .code(201);
  };

  getSongsInPlaylistById: Lifecycle.Method = async (request, h) => {
    const { id } = <Playlist>request.params;
    const { userId } = <any>request.auth.credentials;

    await this._service.verifyPlaylistPrivacy(id, userId);
    const { playlist, source } =
      await this._service.getSongsInPlaylistByPlaylistId(id);

    return h
      .response({
        status: "success",
        data: {
          playlist,
        },
      })
      .header("X-Data-Source", source);
  };

  deleteSongFromPlaylistById: Lifecycle.Method = async (request) => {
    const { id } = <Playlist>request.params;
    const { userId } = <any>request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, userId);
    await this._validator.validateSongPayload(request.payload);

    const { songId } = <any>request.payload;
    await this._service.deleteSongFromPlaylistById(id, songId, userId);

    return {
      status: "success",
      message: "Song deleted from playlist",
    };
  };

  getActivitiesOnPlaylistById: Lifecycle.Method = async (request, h) => {
    const { id } = <Playlist>request.params;
    const { userId } = <any>request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, userId);
    const { activities, source } =
      await this._service.getActivitiesOnPlaylistById(id);

    return h
      .response({
        status: "success",
        data: {
          playlistId: id,
          activities,
        },
      })
      .header("X-Data-Source", source);
  };
}
