import Joi from "joi";

export default Joi.object({
  targetEmail: Joi.string().required(),
});
