import StorageService, { UploadFileParams } from "./StorageService.js";

export default class AlbumsStorageService extends StorageService {
  private readonly _coverFileDir: string;

  constructor(...relativePaths: Array<string>) {
    super(...relativePaths);
    this._coverFileDir = "covers";
  }

  async uploadAlbumCover(params: UploadFileParams) {
    return await this._upload({
      ...params,
      relativePaths: [this._coverFileDir, params.filename],
    });
  }

  getCoverFilePath(filename: string) {
    const filePath = this._getFilePath(this._coverFileDir, filename);
    return this._validateFilePath(filePath);
  }

  async removeAlbumCover(filename: string) {
    await this._remove(this._coverFileDir, filename);
  }
}
