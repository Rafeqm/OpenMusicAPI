/* eslint-disable @typescript-eslint/no-explicit-any */

import { Lifecycle } from "@hapi/hapi";
import { Playlist } from "@prisma/client";

import PlaylistsService from "../../services/database/PlaylistsService";
import playlistsPayloadValidator from "../../validator/playlists";

export default class PlaylistsHandler {
  constructor(
    private readonly _service: PlaylistsService,
    private readonly _validator: typeof playlistsPayloadValidator
  ) {}

  postPlaylist: Lifecycle.Method = async (request, h) => {
    await this._validator.validate("playlist", request.payload);

    const { name } = <Playlist>request.payload;
    const { userId: ownerId } = <any>request.auth.credentials;

    const playlistId = await this._service.addPlaylist(<Playlist>{
      name,
      ownerId,
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

  getPlaylists: Lifecycle.Method = async (request) => {
    const { userId } = <any>request.auth.credentials;
    const playlists = await this._service.getPlaylists(userId);

    return {
      status: "success",
      data: {
        playlists,
      },
    };
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
    await this._validator.validate("song", request.payload);

    const { songId } = <any>request.payload;
    await this._service.addSongToPlaylistById(id, songId);

    return h
      .response({
        status: "success",
        message: "Song added to playlist",
      })
      .code(201);
  };

  getSongsInPlaylistById: Lifecycle.Method = async (request) => {
    const { id } = <Playlist>request.params;
    const { userId } = <any>request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, userId);
    const playlist = await this._service.getSongsInPlaylistById(id);

    return {
      status: "success",
      data: {
        playlist,
      },
    };
  };

  deleteSongFromPlaylistById: Lifecycle.Method = async (request) => {
    const { id } = <Playlist>request.params;
    const { userId } = <any>request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, userId);
    await this._validator.validate("song", request.payload);

    const { songId } = <any>request.payload;
    await this._service.deleteSongFromPlaylistById(id, songId);

    return {
      status: "success",
      message: "Song deleted from playlist",
    };
  };
}
