import fs from "fs";
import path from "path";
import { Readable } from "stream";

export default {
  upload(
    content: Readable,
    filename: string,
    directory: string
  ): Promise<string> {
    if (directory !== undefined) {
      fs.existsSync(directory) || fs.mkdirSync(directory, { recursive: true });
    }

    const filePath = path.resolve(directory, filename);
    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      fileStream.on("error", (error) => reject(error));
      content.pipe(fileStream);
      content.on("end", () => resolve(filename));
    });
  },
};
