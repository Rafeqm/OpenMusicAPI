import Joi from "joi";

export const collaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});
