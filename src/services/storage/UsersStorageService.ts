import StorageService, { UploadFileParams } from "./StorageService.js";

export default class UsersStorageService extends StorageService {
  private readonly _avatarFileDir: string;

  constructor(...relativePaths: Array<string>) {
    super(...relativePaths);
    this._avatarFileDir = "avatar";
  }

  async uploadUserAvatar(params: UploadFileParams) {
    return await this._upload({
      ...params,
      relativePaths: [this._avatarFileDir, params.filename],
    });
  }

  getAvatarFilePath(filename: string) {
    const filePath = this._getFilePath(this._avatarFileDir, filename);
    return this._validateFilePath(filePath);
  }

  async removeUserAvatar(filename: string) {
    await this._remove(this._avatarFileDir, filename);
  }
}
