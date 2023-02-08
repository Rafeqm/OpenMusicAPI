import Joi from "joi";

export const playlistPayloadSchema = Joi.object({
  name: Joi.string().required(),
  private: Joi.boolean(),
});

export const playlistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});
