import { Lifecycle } from "@hapi/hapi";
import { Song } from "@prisma/client";
import path from "path";

import SongsService from "../../services/database/SongsService";
import SongsStorageService from "../../services/storage/SongsStorageService";
import songsValidator from "../../validator/songs";
import uploadsValidator from "../../validator/uploads";

export default class SongsHandler {
  constructor(
    private readonly _songsService: SongsService,
    private readonly _storageService: SongsStorageService,
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

  getSongs: Lifecycle.Method = async (request, h) => {
    const { title, performer } = <Song>request.query;
    const { songs, source } = await this._songsService.getSongs(
      title,
      performer
    );

    return h
      .response({
        status: "success",
        data: {
          songs,
        },
      })
      .header("X-Data-Source", source);
  };

  getSongById: Lifecycle.Method = async (request, h) => {
    const { id } = <Song>request.params;
    const { song, source } = await this._songsService.getSongById(id);

    return h
      .response({
        status: "success",
        data: {
          song,
        },
      })
      .header("X-Data-Source", source);
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
    const filename = await this._songsService.getSongAudioById(id);

    await this._storageService.removeSongAudio(filename);
    await this._songsService.deleteSongById(id);

    return {
      status: "success",
      message: "Song deleted",
    };
  };

  postSongAudioById: Lifecycle.Method = async (request, h) => {
    const { audio } = <any>request.payload;
    await this._uploadsValidator.validateAudioHeaders(audio.hapi.headers);

    const { id } = <Song>request.params;
    const filename = await this._songsService.getSongAudioById(id);
    await this._storageService.removeSongAudio(filename);

    const extname = path.extname(audio.hapi.filename);
    const fileLocation = await this._storageService.uploadSongAudio({
      content: audio,
      contentType: audio.hapi.headers["content-type"],
      filename: id + extname,
    });

    let audioUrl: string;
    try {
      audioUrl = new URL(fileLocation).toString();
    } catch {
      audioUrl = `${request.url.origin}/songs/${id}/audio`;
    }

    await this._songsService.updateSongAudioById(id, audioUrl, extname);

    return h
      .response({
        status: "success",
        message: "Song audio uploaded",
      })
      .code(201);
  };

  getSongAudioById: Lifecycle.Method = async (request, h) => {
    const { id } = <Song>request.params;
    const filename = await this._songsService.getSongAudioById(id);
    const filePath = this._storageService.getAudioFilePath(filename);

    return h.file(filePath);
  };

  postSongLikeById: Lifecycle.Method = async (request, h) => {
    const { id } = <Song>request.params;
    const { userId } = <any>request.auth.credentials;

    await this._songsService.updateSongLikesById({
      songId: id,
      userId,
    });

    return h
      .response({
        status: "success",
        message: "Favorite songs updated",
      })
      .code(201);
  };

  getSongLikesById: Lifecycle.Method = async (request, h) => {
    const { id } = <Song>request.params;
    const { likes, source } = await this._songsService.getSongLikesById(id);

    return h
      .response({
        status: "success",
        data: {
          likes,
        },
      })
      .header("X-Data-Source", source);
  };
}
