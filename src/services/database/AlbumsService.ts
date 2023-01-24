/* eslint-disable no-undef */

import { badData, notFound } from "@hapi/boom";
import { Album, FavoriteAlbum, Prisma, PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

import CacheService from "../cache/CacheService";

export default class AlbumsService {
  private readonly _prisma: PrismaClient;

  constructor(private readonly _cacheService: CacheService) {
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

  async getAlbumById(
    id: Album["id"]
  ): Promise<DataSource<Omit<Album, "coverFileExt">>> {
    const cachedAlbum = await this._cacheService.get(`albums:${id}`);

    if (cachedAlbum !== null) {
      return {
        album: JSON.parse(cachedAlbum),
        source: "cache",
      };
    }

    try {
      const album = await this._prisma.album.findUniqueOrThrow({
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

      await this._cacheService.set(`albums:${id}`, JSON.stringify(album));

      return {
        album,
        source: "database",
      };
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

      await this._cacheService.delete(`albums:${id}`);
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

      await this._cacheService.delete(`albums:${id}`);
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

      await this._cacheService.delete(`albums:${id}`);
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

  async getAlbumCoverById(id: Album["id"]): Promise<string> {
    try {
      const album = await this._prisma.album.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          coverFileExt: true,
        },
      });

      return id + album.coverFileExt;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw notFound("Album not found");
        }
      }

      throw error;
    }
  }

  async updateAlbumLikesById(data: FavoriteAlbum) {
    try {
      await this._prisma.favoriteAlbum.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          await this._prisma.favoriteAlbum.delete({
            where: {
              userId_albumId: data,
            },
          });

          return;
        }

        if (error.code === "P2003") {
          throw notFound("Album not found");
        }
      }

      throw error;
    }
  }

  async getAlbumLikesById(id: FavoriteAlbum["albumId"]): Promise<number> {
    try {
      return await this._prisma.favoriteAlbum.count({
        where: {
          albumId: id,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2003") {
          throw notFound("Album not found");
        }
      }

      throw error;
    }
  }
}
