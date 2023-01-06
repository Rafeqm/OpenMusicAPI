import { Lifecycle } from "@hapi/hapi";
import { Playlist } from "@prisma/client";

import PlaylistsService from "../../services/database/PlaylistsService";
import exportsService from "../../services/message_queue/exportsService";
import exportsPayloadValidator from "../../validator/exports";

export default class ExportsHandler {
  constructor(
    private readonly _exportsService: typeof exportsService,
    private readonly _playlistsService: PlaylistsService,
    private readonly _validator: typeof exportsPayloadValidator
  ) {}

  postExportPlaylistById: Lifecycle.Method = async (request, h) => {
    const { id } = <Playlist>request.params;
    const { userId } = <any>request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, userId);
    await this._validator.validate(request.payload);

    const { targetEmail } = <any>request.payload;
    await this._exportsService.exportPlaylistById(id, targetEmail);

    return h
      .response({
        status: "success",
        message: "Your request is being processed",
      })
      .code(201);
  };
}
