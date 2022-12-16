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
    await this._validator.validate("POST", request.payload);

    const { username, password } = <User>request.payload;
    const id = await this._usersService.verifyUserCredential(
      username,
      password
    );

    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    await this._authenticationsService.addRefreshToken(refreshToken);

    return h
      .response({
        status: "success",
        message: "User authenticated.",
        data: {
          accessToken,
          refreshToken,
        },
      })
      .code(201);
  };
}
