import { Lifecycle } from "@hapi/hapi";
import { Album } from "@prisma/client";

import AlbumsService from "../../services/database/AlbumsService";
import albumsPayloadValidator from "../../validator/albums";

export default class AlbumsHandler {
  constructor(
    private readonly _service: AlbumsService,
    private readonly _validator: typeof albumsPayloadValidator
  ) {}

  postAlbum: Lifecycle.Method = async (request, h) => {
    await this._validator.validate(request.payload);

    const albumId = await this._service.addAlbum(<Album>request.payload);

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
    const album = await this._service.getAlbumById(id);

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
    await this._service.editAlbumById(id, <Album>request.payload);

    return {
      status: "success",
      message: "Album updated",
    };
  };

  deleteAlbumById: Lifecycle.Method = async (request) => {
    const { id } = <Album>request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: "success",
      message: "Album deleted",
    };
  };
}
