/* eslint-disable no-undef */

import { badData, notFound } from "@hapi/boom";
import { Album, FavoriteAlbum, Prisma, PrismaClient } from "@prisma/client";

import CacheService from "../cache/CacheService";

export type AlbumsData = Array<Pick<Album, "id" | "name" | "year">>;

type AlbumsFilter = Pick<Album, "name">;

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
        data,
      });

      await this._cacheService.delete("albums");

      return album.id;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw badData("Data unprocessable");
      }

      throw error;
    }
  }

  async getAlbums(name: Album["name"] = ""): Promise<DataSource<AlbumsData>> {
    const cachedAlbums = await this._cacheService.get("albums");

    if (cachedAlbums !== null) {
      return {
        albums: this._filterAlbums(JSON.parse(cachedAlbums), { name }),
        source: "cache",
      };
    }

    const albums = await this._prisma.album.findMany({
      select: {
        id: true,
        name: true,
        year: true,
      },
    });

    await this._cacheService.set("albums", JSON.stringify(albums));

    return {
      albums: this._filterAlbums(albums, { name }),
      source: "database",
    };
  }

  private _filterAlbums(albums: AlbumsData, filter: AlbumsFilter): AlbumsData {
    return albums.filter((album) =>
      album.name.toLowerCase().includes(filter.name.toLowerCase())
    );
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

      await this._cacheService.delete("albums");
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

      await this._cacheService.delete("albums");
      await this._cacheService.delete(`albums:${id}`);
      await this._cacheService.delete(`albums:${id}:cover`);
      await this._cacheService.delete(`albums:${id}:likes`);
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
      await this._cacheService.delete(`albums:${id}:cover`);
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
    const cachedFilename = await this._cacheService.get(`albums:${id}:cover`);

    if (cachedFilename !== null) {
      return cachedFilename;
    }

    try {
      const album = await this._prisma.album.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          coverFileExt: true,
        },
      });

      const filename = id + album.coverFileExt;
      await this._cacheService.set(`albums:${id}:cover`, filename);

      return filename;
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
      await this._cacheService.delete(`albums:${data.albumId}:likes`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          await this._prisma.favoriteAlbum.delete({
            where: {
              userId_albumId: data,
            },
          });
          await this._cacheService.delete(`albums:${data.albumId}:likes`);

          return;
        }

        if (error.code === "P2003") {
          throw notFound("Album not found");
        }
      }

      throw error;
    }
  }

  async getAlbumLikesCountById(
    id: FavoriteAlbum["albumId"]
  ): Promise<DataSource<number>> {
    const cachedLikesCount = await this._cacheService.get(`albums:${id}:likes`);

    if (cachedLikesCount !== null) {
      return {
        likes: Number(cachedLikesCount),
        source: "cache",
      };
    }

    try {
      const album = await this._prisma.album.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          _count: {
            select: {
              likes: true,
            },
          },
        },
      });

      await this._cacheService.set(`albums:${id}:likes`, album._count.likes);

      return {
        likes: album._count.likes,
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
}
