import { notFound } from "@hapi/boom";
import { Lifecycle } from "@hapi/hapi";
import { Album } from "@prisma/client";
import fs from "fs";
import path from "path";

import AlbumsService from "../../services/database/AlbumsService";
import StorageService from "../../services/storage/StorageService";
import albumsValidator from "../../validator/albums";
import uploadsValidator from "../../validator/uploads";

export default class AlbumsHandler {
  private readonly _albumCoverDir: string;

  constructor(
    private readonly _albumsService: AlbumsService,
    private readonly _storageService: StorageService,
    private readonly _albumsValidator: typeof albumsValidator,
    private readonly _uploadsValidator: typeof uploadsValidator
  ) {
    this._albumCoverDir = "covers";
  }

  postAlbum: Lifecycle.Method = async (request, h) => {
    await this._albumsValidator.validateAlbumPayload(request.payload);

    const albumId = await this._albumsService.addAlbum(<Album>request.payload);

    return h
      .response({
        status: "success",
        message: "Album added",
        data: {
          albumId,
        },
      })
      .code(201);
  };

  getAlbumById: Lifecycle.Method = async (request) => {
    const { id } = <Album>request.params;
    const album = await this._albumsService.getAlbumById(id);

    return {
      status: "success",
      data: {
        album,
      },
    };
  };

  putAlbumById: Lifecycle.Method = async (request) => {
    await this._albumsValidator.validateAlbumPayload(request.payload);

    const { id } = <Album>request.params;
    await this._albumsService.editAlbumById(id, <Album>request.payload);

    return {
      status: "success",
      message: "Album updated",
    };
  };

  deleteAlbumById: Lifecycle.Method = async (request) => {
    const { id } = <Album>request.params;
    const coverFilename = await this._albumsService.getAlbumCoverById(id);

    await this._storageService.remove({
      relativePaths: [this._albumCoverDir, coverFilename],
      storage: process.env.NODE_ENV === "production" ? "remote" : "local",
    });
    await this._albumsService.deleteAlbumById(id);

    return {
      status: "success",
      message: "Album deleted",
    };
  };

  postAlbumCoverImageById: Lifecycle.Method = async (request, h) => {
    const { cover } = <any>request.payload;
    await this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

    const { id } = <Album>request.params;
    const oldFilename = await this._albumsService.getAlbumCoverById(id);
    const storage = process.env.NODE_ENV === "production" ? "remote" : "local";
    await this._storageService.remove({
      relativePaths: [this._albumCoverDir, oldFilename],
      storage,
    });

    const extname = path.extname(cover.hapi.filename);
    const fileLocation = await this._storageService.upload({
      content: cover,
      contentType: cover.hapi.headers["content-type"],
      relativePaths: [this._albumCoverDir, id + extname],
      storage,
    });

    let coverUrl: string;
    try {
      coverUrl = new URL(fileLocation).toString();
    } catch {
      coverUrl = `${request.url.origin}/albums/${id}/cover`;
    }

    await this._albumsService.updateAlbumCoverImageById(id, coverUrl, extname);

    return h
      .response({
        status: "success",
        message: "Album cover image uploaded",
      })
      .code(201);
  };

  getAlbumCoverImageById: Lifecycle.Method = async (request, h) => {
    const { id } = <Album>request.params;
    const fileName = await this._albumsService.getAlbumCoverById(id);
    const filePath = this._storageService.getLocalFile(
      this._albumCoverDir,
      fileName
    );

    if (!fs.existsSync(filePath)) throw notFound("Album cover not found");
    return h.file(filePath);
  };
}
