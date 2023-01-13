import fs from "fs";
import path from "path";
import { Readable } from "stream";

export default class StorageService {
  private _directory: string | undefined;

  public get directory(): string | undefined {
    return this._directory;
  }

  public set directory(value: string | undefined) {
    if (value !== undefined) {
      fs.existsSync(value) || fs.mkdirSync(value, { recursive: true });
    }

    this._directory = value;
  }

  upload(content: Readable, relativePath: string): Promise<string> {
    if (this._directory === undefined) {
      throw new Error("Upload directory is not set");
    }

    const filePath = path.resolve(this._directory, relativePath);
    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      fileStream.on("error", (error) => reject(error));
      content.pipe(fileStream);
      content.on("end", () => resolve(filePath));
    });
  }

  getFile(relativePath: string) {
    if (this._directory === undefined) {
      throw new Error("Upload directory is not set");
    }

    return path.resolve(this._directory, relativePath);
  }
}
