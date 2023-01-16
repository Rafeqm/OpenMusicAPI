import Joi from "joi";

export const playlistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

export const songPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});
