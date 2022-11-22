import { Lifecycle } from "@hapi/hapi";
import { Song } from "@prisma/client";

import SongsService from "../../services/database/SongsService";
import SongsPayloadValidator from "../../validator/songs";

export default class SongsHandler {
  constructor(
    private readonly service: SongsService,
    private readonly validator: typeof SongsPayloadValidator
  ) {}

  postSong: Lifecycle.Method = async (request, h) => {
    await this.validator.validateAsync(request.payload);

    const { title, year, performer, genre, duration, albumId } = <Song>(
      request.payload
    );
    const songId = await this.service.addSong(
      title,
      year,
      performer,
      genre,
      duration,
      albumId
    );

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
    const { title, performer } = request.query;
    const songs = await this.service.getSongs(title, performer);

    return {
      status: "success",
      data: {
        songs,
      },
    };
  };

  getSongById: Lifecycle.Method = async (request) => {
    const { id } = request.params;
    const song = await this.service.getSongById(id);

    return {
      status: "success",
      data: {
        song,
      },
    };
  };

  putSongById: Lifecycle.Method = async (request) => {
    await this.validator.validateAsync(request.payload);

    const { id } = request.params;
    const { title, year, performer, genre, duration, albumId } = <Song>(
      request.payload
    );
    await this.service.editSongById(
      id,
      title,
      year,
      performer,
      genre,
      duration,
      albumId
    );

    return {
      status: "success",
      message: "Song updated successfully.",
    };
  };

  deleteSongById: Lifecycle.Method = async (request) => {
    const { id } = request.params;
    await this.service.deleteSongById(id);

    return {
      status: "success",
      message: "Song deleted successfully.",
    };
  };
}
