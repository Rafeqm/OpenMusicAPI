import { notFound } from "@hapi/boom";
import { Lifecycle } from "@hapi/hapi";
import { Album } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import AlbumsService from "../../services/database/AlbumsService";
import StorageService from "../../services/storage/StorageService";
import albumsPayloadValidator from "../../validator/albums";
import uploadFileHeadersValidator from "../../validator/uploads";

export default class AlbumsHandler {
  constructor(
    private readonly _albumsService: AlbumsService,
    private readonly _storageService: StorageService,
    private readonly _albumsValidator: typeof albumsPayloadValidator,
    private readonly _uploadsValidator: typeof uploadFileHeadersValidator
  ) {
    this._storageService.directory = path.resolve(
      path.dirname(fileURLToPath(import.meta.url))
    );
  }

  postAlbum: Lifecycle.Method = async (request, h) => {
    await this._albumsValidator.validate(request.payload);

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
    await this._albumsValidator.validate(request.payload);

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
    await this._uploadsValidator.validate(cover.hapi.headers, "image");

    const { id } = <Album>request.params;
    const fileExtension = path.extname(cover.hapi.filename);
    const fileName = id + fileExtension;
    let coverUrl: string;

    if (process.env.NODE_ENV === "production") {
      coverUrl = await this._storageService.uploadToRemote(
        cover._data,
        fileName,
        cover.hapi.headers["content-type"]
      );

      await this._albumsService.updateAlbumCoverById(id, coverUrl);
    } else {
      coverUrl = `${request.url.origin}/albums/${id}/cover`;

      await this._storageService.uploadToLocal(cover, `covers/${fileName}`);
      await this._albumsService.updateAlbumCoverById(
        id,
        coverUrl,
        fileExtension
      );
    }

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
    const filePath = this._storageService.getLocalFile(`covers/${fileName}`);

    if (!fs.existsSync(filePath)) throw notFound("Album cover not found");
    return h.file(filePath);
  };
}
