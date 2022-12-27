/* eslint-disable @typescript-eslint/no-explicit-any */

import { Lifecycle } from "@hapi/hapi";
import { Collaboration } from "@prisma/client";

import CollaborationsService from "../../services/database/CollaborationsService";
import PlaylistsService from "../../services/database/PlaylistsService";
import collaborationsPayloadValidator from "../../validator/collaborations";

export default class CollaborationsHandler {
  constructor(
    private readonly _collaborationsService: CollaborationsService,
    private readonly _playlistsService: PlaylistsService,
    private readonly _validator: typeof collaborationsPayloadValidator
  ) {}

  postCollaboration: Lifecycle.Method = async (request, h) => {
    await this._validator.validate(request.payload);

    const { playlistId, userId } = <Collaboration>request.payload;
    const { userId: ownerId } = <any>request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);
    const collaborationId = await this._collaborationsService.addCollaboration(<
      Collaboration
    >{
      playlistId,
      userId,
    });

    return h
      .response({
        status: "success",
        message: "Collaboration added",
        data: {
          collaborationId,
        },
      })
      .code(201);
  };

  deleteCollaboration: Lifecycle.Method = async (request) => {
    await this._validator.validate(request.payload);

    const { playlistId, userId } = <Collaboration>request.payload;
    const { userId: ownerId } = <any>request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    return {
      status: "success",
      message: "Collaboration deleted",
    };
  };
}
