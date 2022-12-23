import Joi from "joi";

const currentYear = new Date().getFullYear();

export default Joi.object({
  title: Joi.string().required(),
  year: Joi.number().max(currentYear).required(),
  performer: Joi.string().required(),
  genre: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});
