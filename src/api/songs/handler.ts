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

  getSongs: Lifecycle.Method = async () => {
    const songs = await this.service.getSongs();

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
}
