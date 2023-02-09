import { Lifecycle } from "@hapi/hapi";
import { Album } from "@prisma/client";
import path from "path";

import AlbumsService from "../../services/database/AlbumsService";
import AlbumsStorageService from "../../services/storage/AlbumsStorageService";
import albumsValidator from "../../validator/albums";
import uploadsValidator from "../../validator/uploads";

export default class AlbumsHandler {
  constructor(
    private readonly _albumsService: AlbumsService,
    private readonly _storageService: AlbumsStorageService,
    private readonly _albumsValidator: typeof albumsValidator,
    private readonly _uploadsValidator: typeof uploadsValidator
  ) {}

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

  getAlbums: Lifecycle.Method = async (request, h) => {
    const { name } = <Album>request.query;
    const { albums, source } = await this._albumsService.getAlbums(name);

    return h
      .response({
        status: "success",
        data: {
          albums,
        },
      })
      .header("X-Data-Source", source);
  };

  getAlbumById: Lifecycle.Method = async (request, h) => {
    const { id } = <Album>request.params;
    const { album, source } = await this._albumsService.getAlbumById(id);

    return h
      .response({
        status: "success",
        data: {
          album,
        },
      })
      .header("X-Data-Source", source);
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
    const filename = await this._albumsService.getAlbumCoverById(id);

    await this._storageService.removeAlbumCover(filename);
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
    const filename = await this._albumsService.getAlbumCoverById(id);
    await this._storageService.removeAlbumCover(filename);

    const extname = path.extname(cover.hapi.filename);
    const fileLocation = await this._storageService.uploadAlbumCover({
      content: cover,
      contentType: cover.hapi.headers["content-type"],
      filename: id + extname,
    });

    let coverUrl: string;
    try {
      coverUrl = new URL(fileLocation).toString();
    } catch {
      coverUrl = `${request.url.origin}/albums/${id}/cover`;
    }

    await this._albumsService.updateAlbumCoverById(id, coverUrl, extname);

    return h
      .response({
        status: "success",
        message: "Album cover image uploaded",
      })
      .code(201);
  };

  getAlbumCoverImageById: Lifecycle.Method = async (request, h) => {
    const { id } = <Album>request.params;
    const filename = await this._albumsService.getAlbumCoverById(id);
    const filePath = this._storageService.getCoverFilePath(filename);

    return h.file(filePath);
  };

  postAlbumLikeById: Lifecycle.Method = async (request, h) => {
    const { id } = <Album>request.params;
    const { userId } = <any>request.auth.credentials;

    await this._albumsService.updateAlbumLikesById({
      albumId: id,
      userId,
    });

    return h
      .response({
        status: "success",
        message: "Favorite albums updated",
      })
      .code(201);
  };

  getAlbumLikeById: Lifecycle.Method = async (request, h) => {
    const { id } = <Album>request.params;
    const { likes, source } = await this._albumsService.getAlbumLikesById(id);

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
