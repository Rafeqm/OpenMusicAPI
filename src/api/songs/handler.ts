import { notFound } from "@hapi/boom";
import { Lifecycle } from "@hapi/hapi";
import { Song } from "@prisma/client";
import fs from "fs";
import path from "path";

import SongsService from "../../services/database/SongsService";
import StorageService from "../../services/storage/StorageService";
import songsValidator from "../../validator/songs";
import uploadsValidator from "../../validator/uploads";

export default class SongsHandler {
  private readonly _songAudioDir: string;

  constructor(
    private readonly _songsService: SongsService,
    private readonly _storageService: StorageService,
    private readonly _songsValidator: typeof songsValidator,
    private readonly _uploadsValidator: typeof uploadsValidator
  ) {
    this._songAudioDir = "audio";
  }

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

  postSongAudioById: Lifecycle.Method = async (request, h) => {
    const { audio } = <any>request.payload;
    await this._uploadsValidator.validateAudioHeaders(audio.hapi.headers);

    const { id } = <Song>request.params;
    const extname = path.extname(audio.hapi.filename);
    const filename = id + extname;
    let audioUrl: string;

    if (process.env.NODE_ENV === "production") {
      audioUrl = await this._storageService.uploadToRemote(
        audio._data,
        filename,
        audio.hapi.headers["content-type"]
      );

      await this._songsService.updateSongAudioById(id, audioUrl);
    } else {
      audioUrl = `${request.url.origin}/songs/${id}/audio`;

      await this._storageService.uploadToLocal(
        audio,
        this._songAudioDir,
        filename
      );
      await this._songsService.updateSongAudioById(id, audioUrl, extname);
    }

    return h
      .response({
        status: "success",
        message: "Song audio uploaded",
      })
      .code(201);
  };

  getSongAudioById: Lifecycle.Method = async (request, h) => {
    const { id } = <Song>request.params;
    const fileName = await this._songsService.getSongAudioById(id);
    const filePath = this._storageService.getLocalFile(
      this._songAudioDir,
      fileName
    );

    if (!fs.existsSync(filePath)) throw notFound("Song audio not found");
    return h.file(filePath);
  };
}
