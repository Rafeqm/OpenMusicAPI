import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

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

  uploadToLocal(
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

  async uploadToRemote(
    content: Buffer,
    filename: string,
    contentType: string
  ): Promise<string> {
    const parameter: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      ContentType: contentType,
      Key: filename,
      Body: content,
    };
    const data = await this._s3.upload(parameter).promise();

    return data.Location;
  }

  getLocalFile(...relativePaths: Array<string>): string {
    return path.resolve(this._directory, ...relativePaths);
  }

  removeLocalFile(...relativePaths: Array<string>) {
    const filePath = this.getLocalFile(...relativePaths);
    fs.rmSync(filePath, { force: true });
  }
}
