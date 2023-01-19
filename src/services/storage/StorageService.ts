import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export type FileParams = {
  relativePaths: Array<string>;
  storage?: "local" | "remote";
};

export type UploadFileParams = FileParams & {
  content: Readable;
  contentType: string;
};

export default class StorageService {
  private readonly _directory: string;
  private readonly _s3: AWS.S3;

  constructor(...relativePaths: Array<string>) {
    this._directory = path.resolve(process.cwd(), ...relativePaths);
    this._s3 = new AWS.S3();
  }

  private _mkdir(
    relativePath: fs.PathLike,
    options?: fs.MakeDirectoryOptions
  ): string | void {
    if (!fs.existsSync(relativePath)) {
      return fs.mkdirSync(relativePath, options);
    }
  }

  private _uploadToLocal(
    content: Readable,
    ...relativePaths: Array<string>
  ): Promise<string> {
    const filePath = path.resolve(this._directory, ...relativePaths);
    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      fileStream.on("error", (error) => reject(error));
      content.on("end", () => resolve(filePath));

      this._mkdir(path.dirname(filePath), { recursive: true });
      content.pipe(fileStream);
    });
  }

  private async _uploadToRemote(
    key: string,
    body: AWS.S3.Body,
    contentType: string
  ): Promise<string> {
    const parameter: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    };

    const data = await this._s3.upload(parameter).promise();
    return data.Location;
  }

  async upload(params: UploadFileParams): Promise<string> {
    const { content, contentType, relativePaths, storage = "local" } = params;

    if (storage === "remote") {
      return await this._uploadToRemote(
        path.join(...relativePaths),
        content,
        contentType
      );
    }

    return await this._uploadToLocal(content, ...relativePaths);
  }

  getLocalFile(...relativePaths: Array<string>): string {
    return path.resolve(this._directory, ...relativePaths);
  }

  private _removeLocalFile(...relativePaths: Array<string>) {
    const filePath = this.getLocalFile(...relativePaths);
    fs.rmSync(filePath, { force: true });
  }

  private async _removeRemoteFile(key: string) {
    const parameter: AWS.S3.DeleteObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    };

    await this._s3.deleteObject(parameter).promise();
  }

  async remove(params: FileParams) {
    const { relativePaths, storage = "local" } = params;

    if (storage === "remote") {
      await this._removeRemoteFile(path.join(...relativePaths));
    }

    this._removeLocalFile(...relativePaths);
  }
}
