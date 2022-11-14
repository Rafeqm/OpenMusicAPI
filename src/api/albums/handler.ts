import { isBoom } from "@hapi/boom";
import { Lifecycle } from "@hapi/hapi";
import { Album } from "@prisma/client";

import AlbumsService from "../../services/database/AlbumsService";

export default class AlbumsHandler {
  constructor(private readonly service: AlbumsService) {}

  postAlbum: Lifecycle.Method = async (request, h) => {
    try {
      const { name, year } = <Album>request.payload;
      const albumId = await this.service.addAlbum(name, year);

      return h
        .response({
          status: "success",
          message: "Album added successfully",
          data: {
            albumId,
          },
        })
        .code(201);
    } catch (error) {
      if (isBoom(error)) {
        return h
          .response({
            status: "fail",
            message: error.message,
          })
          .code(error.output.statusCode);
      }

      // Server ERROR!
      console.error(error);
      return h
        .response({
          status: "error",
          message: "Sorry, there was a failure on our server.",
        })
        .code(500);
    }
  };
}
