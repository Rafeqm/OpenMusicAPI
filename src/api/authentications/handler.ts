import { Lifecycle } from "@hapi/hapi";
import { User } from "@prisma/client";

import AuthenticationsService from "../../services/database/AuthenticationsService";
import UsersService from "../../services/database/UsersService";
import { tokenManager } from "../../utils/tokenize";
import authenticationsPayloadValidator from "../../validator/authentications";

export default class AuthenticationsHandler {
  constructor(
    private readonly _authenticationsService: AuthenticationsService,
    private readonly _usersService: UsersService,
    private readonly _validator: typeof authenticationsPayloadValidator,
    private readonly _tokenManager: typeof tokenManager
  ) {}

  postAuthentication: Lifecycle.Method = async (request, h) => {
    await this._validator.validate(request.payload, "POST");

    const { username, password } = <User>request.payload;
    const userId = await this._usersService.verifyUserCredential(
      username,
      password
    );

    const accessToken = this._tokenManager.generateAccessToken({ userId });
    const refreshToken = this._tokenManager.generateRefreshToken({ userId });

    await this._authenticationsService.addRefreshToken(refreshToken);

    return h
      .response({
        status: "success",
        message: "User authenticated",
        data: {
          accessToken,
          refreshToken,
        },
      })
      .code(201);
  };

  putAuthentication: Lifecycle.Method = async (request) => {
    await this._validator.validate(request.payload, "PUT");

    const { refreshToken } = <any>request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);

    const { userId } = this._tokenManager.verifyRefreshToken(refreshToken);
    const accessToken = this._tokenManager.generateAccessToken({ userId });

    return {
      status: "success",
      message: "Access token updated",
      data: {
        accessToken,
      },
    };
  };

  deleteAuthentication: Lifecycle.Method = async (request) => {
    await this._validator.validate(request.payload, "DELETE");

    const { refreshToken } = <any>request.payload;
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: "success",
      message: "Refresh token deleted",
    };
  };
}
