import { notFound } from "@hapi/boom";
import { Lifecycle } from "@hapi/hapi";
import { Album } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import AlbumsService from "../../services/database/AlbumsService";
import storageService from "../../services/storage/storageService";
import albumsPayloadValidator from "../../validator/albums";

export default class AlbumsHandler {
  constructor(
    private readonly _albumsService: AlbumsService,
    private readonly _storageService: typeof storageService,
    private readonly _validator: typeof albumsPayloadValidator
  ) {}

  postAlbum: Lifecycle.Method = async (request, h) => {
    await this._validator.validate(request.payload);

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
    await this._validator.validate(request.payload);

    const { id } = <Album>request.params;
    await this._albumsService.editAlbumById(id, <Album>request.payload);

    return {
      status: "success",
      message: "Album updated",
    };
  };

  deleteAlbumById: Lifecycle.Method = async (request) => {
    const { id } = <Album>request.params;
    await this._albumsService.deleteAlbumById(id);

    return {
      status: "success",
      message: "Album deleted",
    };
  };

  postAlbumCoverImageById: Lifecycle.Method = async (request, h) => {
    const { cover } = <any>request.payload;
    await this._validator.validate(cover.hapi.headers, "coverImage");

    const { id } = <Album>request.params;
    const fileExtension = path.extname(cover.hapi.filename);
    const fileName = id + fileExtension;
    const directory = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "covers"
    );
    const coverUrl = `${request.url.origin}/albums/${id}/cover`;

    await this._storageService.upload(cover, fileName, directory);
    await this._albumsService.updateAlbumCoverById(id, coverUrl, fileExtension);

    return h
      .response({
        status: "success",
        message: "Cover image uploaded",
      })
      .code(201);
  };

  getAlbumCoverImageById: Lifecycle.Method = async (request, h) => {
    const { id } = <Album>request.params;
    const fileName = await this._albumsService.getAlbumCoverById(id);
    const filePath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "covers",
      fileName
    );

    if (!fs.existsSync(filePath)) throw notFound("Album cover not found");
    return h.file(filePath);
  };
}
