import Joi from "joi";

const currentYear = new Date().getFullYear();

export const albumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().max(currentYear).required(),
});

export const coverImageHeadersSchema = Joi.object({
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
