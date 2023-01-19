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
    const audioFilename = await this._songsService.getSongAudioById(id);

    await this._storageService.remove({
      relativePaths: [this._songAudioDir, audioFilename],
      storage: process.env.NODE_ENV === "production" ? "remote" : "local",
    });
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
    const oldFilename = await this._songsService.getSongAudioById(id);
    const storage = process.env.NODE_ENV === "production" ? "remote" : "local";
    await this._storageService.remove({
      relativePaths: [this._songAudioDir, oldFilename],
      storage,
    });

    const extname = path.extname(audio.hapi.filename);
    const fileLocation = await this._storageService.upload({
      content: audio,
      contentType: audio.hapi.headers["content-type"],
      relativePaths: [this._songAudioDir, id + extname],
      storage,
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
    const fileName = await this._songsService.getSongAudioById(id);
    const filePath = this._storageService.getLocalFile(
      this._songAudioDir,
      fileName
    );

    if (!fs.existsSync(filePath)) throw notFound("Song audio not found");
    return h.file(filePath);
  };
}
