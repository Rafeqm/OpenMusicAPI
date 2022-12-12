import { Lifecycle } from "@hapi/hapi";
import { Song } from "@prisma/client";

import SongsService from "../../services/database/SongsService";
import SongsPayloadValidator from "../../validator/songs";

export default class SongsHandler {
  constructor(
    private readonly _service: SongsService,
    private readonly _validator: typeof SongsPayloadValidator
  ) {}

  postSong: Lifecycle.Method = async (request, h) => {
    await this._validator.validateAsync(request.payload);

    const songId = await this._service.addSong(<Song>request.payload);

    return h
      .response({
        status: "success",
        message: "Song added successfully.",
        data: {
          songId,
        },
      })
      .code(201);
  };

  getSongs: Lifecycle.Method = async (request) => {
    const { title, performer } = <Partial<Song>>request.query;
    const songs = await this._service.getSongs(title, performer);

    return {
      status: "success",
      data: {
        songs,
      },
    };
  };

  getSongById: Lifecycle.Method = async (request) => {
    const { id } = <Song>request.params;
    const song = await this._service.getSongById(id);

    return {
      status: "success",
      data: {
        song,
      },
    };
  };

  putSongById: Lifecycle.Method = async (request) => {
    await this._validator.validateAsync(request.payload);

    const { id } = <Song>request.params;
    await this._service.editSongById(id, <Song>request.payload);

    return {
      status: "success",
      message: "Song updated successfully.",
    };
  };

  deleteSongById: Lifecycle.Method = async (request) => {
    const { id } = <Song>request.params;
    await this._service.deleteSongById(id);

    return {
      status: "success",
      message: "Song deleted successfully.",
    };
  };
}
