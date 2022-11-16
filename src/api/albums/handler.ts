import { Lifecycle } from "@hapi/hapi";
import { Album } from "@prisma/client";

import AlbumsService from "../../services/database/AlbumsService";
import AlbumsPayloadValidator from "../../validator/albums";

export default class AlbumsHandler {
  constructor(
    private readonly service: AlbumsService,
    private readonly validator: typeof AlbumsPayloadValidator
  ) {}

  postAlbum: Lifecycle.Method = async (request, h) => {
    await this.validator.validateAsync(request.payload);

    const { name, year } = <Album>request.payload;
    const albumId = await this.service.addAlbum(name, year);

    return h
      .response({
        status: "success",
        message: "Album added successfully.",
        data: {
          albumId,
        },
      })
      .code(201);
  };

  getAlbumById: Lifecycle.Method = async (request) => {
    const { id } = request.params;
    const album = await this.service.getAlbumById(id);

    return {
      status: "success",
      data: {
        album,
      },
    };
  };

  putAlbumById: Lifecycle.Method = async (request) => {
    await this.validator.validateAsync(request.payload);

    const { id } = request.params;
    const { name, year } = <Album>request.payload;
    await this.service.editAlbumById(id, name, year);

    return {
      status: "success",
      message: "Album updated successfully.",
    };
  };

  deleteAlbumById: Lifecycle.Method = async (request) => {
    const { id } = request.params;
    await this.service.deleteAlbumById(id);

    return {
      status: "success",
      message: "Album deleted successfully.",
    };
  };
}
