import Joi from "joi";

export const userPayloadSchema = Joi.object({
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
