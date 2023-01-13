import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export default class StorageService {
  private _directory: string | undefined;
  private readonly _s3: AWS.S3;

  constructor() {
    this._s3 = new AWS.S3();
  }

  public get directory(): string | undefined {
    return this._directory;
  }

  public set directory(value: string | undefined) {
    if (value !== undefined) {
      fs.existsSync(value) || fs.mkdirSync(value, { recursive: true });
    }

    this._directory = value;
  }

  uploadToLocal(content: Readable, relativePath: string): Promise<string> {
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

  getLocalFile(relativePath: string) {
    if (this._directory === undefined) {
      throw new Error("Upload directory is not set");
    }

    return path.resolve(this._directory, relativePath);
  }
}
