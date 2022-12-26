import Joi from "joi";

export default Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});
