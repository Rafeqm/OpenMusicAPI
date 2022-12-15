import Joi from "joi";

export default {
  POST: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),

  PUT: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  DELETE: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};
