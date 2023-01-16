import { Lifecycle } from "@hapi/hapi";
import { Collaboration } from "@prisma/client";

import CollaborationsService from "../../services/database/CollaborationsService";
import PlaylistsService from "../../services/database/PlaylistsService";
import collaborationsValidator from "../../validator/collaborations";

export default class CollaborationsHandler {
  constructor(
    private readonly _collaborationsService: CollaborationsService,
    private readonly _playlistsService: PlaylistsService,
    private readonly _validator: typeof collaborationsValidator
  ) {}

  postCollaboration: Lifecycle.Method = async (request, h) => {
    await this._validator.validateCollaborationPayload(request.payload);

    const { playlistId } = <Collaboration>request.payload;
    const { userId } = <any>request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    const collaborationId = await this._collaborationsService.addCollaboration(
      <Collaboration>request.payload
    );

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
    await this._validator.validateCollaborationPayload(request.payload);

    const { playlistId } = <Collaboration>request.payload;
    const { userId } = <any>request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    await this._collaborationsService.deleteCollaboration(
      <Collaboration>request.payload
    );

    return {
      status: "success",
      message: "Collaboration deleted",
    };
  };
}
