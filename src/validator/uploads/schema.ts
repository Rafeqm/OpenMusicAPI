import Joi from "joi";

export const imageHeadersSchema = Joi.object({
  "content-type": Joi.string()
    .valid(
      "image/apng",
      "image/avif",
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/webp"
    )
    .required(),
}).unknown();

export const audioHeadersSchema = Joi.object({
  "content-type": Joi.string()
    .valid(
      "audio/3gpp",
      "audio/aac",
      "audio/flac",
      "audio/mpeg",
      "audio/mp3",
      "audio/mp4",
      "audio/ogg",
      "audio/wav",
      "audio/webm"
    )
    .required(),
}).unknown();
