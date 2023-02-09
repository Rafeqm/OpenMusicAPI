import StorageService, { UploadFileParams } from "./StorageService.js";

export default class SongsStorageService extends StorageService {
  private readonly _audioFileDir: string;

  constructor(...relativePaths: Array<string>) {
    super(...relativePaths);
    this._audioFileDir = "audio";
  }

  async uploadSongAudio(params: UploadFileParams) {
    return await this._upload({
      ...params,
      relativePaths: [this._audioFileDir, params.filename],
    });
  }

  getAudioFilePath(filename: string) {
    const filePath = this._getFilePath(this._audioFileDir, filename);
    return this._validateFilePath(filePath);
  }

  async removeSongAudio(filename: string) {
    await this._remove(this._audioFileDir, filename);
  }
}
