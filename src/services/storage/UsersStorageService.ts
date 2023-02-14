import StorageService from "./StorageService.js";

export default class UsersStorageService extends StorageService {
  constructor(...relativePaths: Array<string>) {
    super(...relativePaths);
  }
}
