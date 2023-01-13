import Joi from "joi";

const currentYear = new Date().getFullYear();

export default Joi.object({
  name: Joi.string().required(),
  year: Joi.number().max(currentYear).required(),
});
