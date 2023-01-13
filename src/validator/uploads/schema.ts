import Joi from "joi";

export default {
  image: Joi.object({
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
  }).unknown(),
};
