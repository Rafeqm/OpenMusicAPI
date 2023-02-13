import Joi from "joi";

export const postUserPayloadSchema = Joi.object({
  username: Joi.string()
    .pattern(/^\w+$/)
    .message(
      '"username" must only contain alpha-numeric characters and underscore'
    )
    .min(4)
    .max(25)
    .required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

export const putUserPayloadSchema = Joi.object({
  username: Joi.string()
    .pattern(/^\w+$/)
    .message(
      '"username" must only contain alpha-numeric characters and underscore'
    )
    .min(4)
    .max(25)
    .required(),
  password: Joi.string(),
  fullname: Joi.string().required(),
});
