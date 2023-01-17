import { Lifecycle } from "@hapi/hapi";
import { Song } from "@prisma/client";

import SongsService from "../../services/database/SongsService";
import StorageService from "../../services/storage/StorageService";
import songsValidator from "../../validator/songs";
import uploadsValidator from "../../validator/uploads";

export default class SongsHandler {
  constructor(
    private readonly _songsService: SongsService,
    private readonly _storageService: StorageService,
    private readonly _songsValidator: typeof songsValidator,
    private readonly _uploadsValidator: typeof uploadsValidator
  ) {}

  postSong: Lifecycle.Method = async (request, h) => {
    await this._songsValidator.validateSongPayload(request.payload);

    const songId = await this._songsService.addSong(<Song>request.payload);

    return h
      .response({
        status: "success",
        message: "Song added",
        data: {
          songId,
        },
      })
      .code(201);
  };

  getSongs: Lifecycle.Method = async (request) => {
    const { title, performer } = <Song>request.query;
    const songs = await this._songsService.getSongs(title, performer);

    return {
      status: "success",
      data: {
        songs,
      },
    };
  };

  getSongById: Lifecycle.Method = async (request) => {
    const { id } = <Song>request.params;
    const song = await this._songsService.getSongById(id);

    return {
      status: "success",
      data: {
        song,
      },
    };
  };

  putSongById: Lifecycle.Method = async (request) => {
    await this._songsValidator.validateSongPayload(request.payload);

    const { id } = <Song>request.params;
    await this._songsService.editSongById(id, <Song>request.payload);

    return {
      status: "success",
      message: "Song updated",
    };
  };

  deleteSongById: Lifecycle.Method = async (request) => {
    const { id } = <Song>request.params;
    await this._songsService.deleteSongById(id);

    return {
      status: "success",
      message: "Song deleted",
    };
  };
}
