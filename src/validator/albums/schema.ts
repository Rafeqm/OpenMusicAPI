import Joi from "joi";

const currentYear = new Date().getFullYear();

export const albumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().max(currentYear).required(),
});
