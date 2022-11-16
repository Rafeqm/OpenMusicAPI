import Joi from "joi";

export default Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});
