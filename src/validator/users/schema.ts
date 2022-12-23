import Joi from "joi";

export default Joi.object({
  username: Joi.string().min(4).max(25).required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});
