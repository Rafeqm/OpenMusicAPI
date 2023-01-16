import Joi from "joi";

export const imageHeadersSchema =  Joi.object({
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
  }).unknown()
