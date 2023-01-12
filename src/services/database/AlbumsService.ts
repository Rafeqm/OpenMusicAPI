import { badData, notFound } from "@hapi/boom";
import { Album, Prisma, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

export default class AlbumsService {
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient({
      errorFormat: "pretty",
    });
  }

  async addAlbum(data: Album): Promise<Album["id"]> {
    try {
      const album = await this._prisma.album.create({
        data: {
          ...data,
          id: nanoid(),
        },
      });

      return album.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
    }
  }

  async getAlbumById(id: Album["id"]): Promise<Omit<Album, "coverFileExt">> {
    try {
      return await this._prisma.album.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          year: true,
          coverUrl: true,
          songs: {
            select: {
              id: true,
              title: true,
              performer: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Album not found");
        }
      }

      throw error;
    }
  }

  async editAlbumById(id: Album["id"], data: Album) {
    try {
      await this._prisma.album.update({
        where: {
          id,
        },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Album not found");
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
    }
  }

  async deleteAlbumById(id: Album["id"]) {
    try {
      await this._prisma.album.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Album not found");
        }
      }

      throw error;
    }
  }

  async updateAlbumCoverById(
    id: Album["id"],
    coverUrl: Album["coverUrl"] = null,
    fileExt: Album["coverFileExt"] = null
  ) {
    try {
      await this._prisma.album.update({
        where: {
          id,
        },
        data: {
          coverUrl,
          coverFileExt: fileExt,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Album not found");
        }
      }

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
    }
  }
}
