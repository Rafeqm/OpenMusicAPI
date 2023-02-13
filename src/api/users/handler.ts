import { Lifecycle } from "@hapi/hapi";
import { User } from "@prisma/client";

import UsersService from "../../services/database/UsersService";
import usersValidator from "../../validator/users";

export default class UsersHandler {
  constructor(
    private readonly _service: UsersService,
    private readonly _validator: typeof usersValidator
  ) {}

  postUser: Lifecycle.Method = async (request, h) => {
    await this._validator.validatePostUserPayload(request.payload);

    const userId = await this._service.addUser(<User>request.payload);

    return h
      .response({
        status: "success",
        message: "User added",
        data: {
          userId,
        },
      })
      .code(201);
  };

  getUsers: Lifecycle.Method = async (request, h) => {
    const { username, fullname } = <User>request.query;
    const { users, source } = await this._service.getUsers(username, fullname);

    return h
      .response({
        status: "success",
        data: {
          users,
        },
      })
      .header("X-Data-Source", source);
  };

  getUserById: Lifecycle.Method = async (request, h) => {
    const { id } = <User>request.params;
    const { user, source } = await this._service.getUserById(id);

    return h
      .response({
        status: "success",
        data: {
          user,
        },
      })
      .header("X-Data-Source", source);
  };

  putUserByCredential: Lifecycle.Method = async (request) => {
    await this._validator.validatePutUserPayload(request.payload);

    const { userId } = <any>request.auth.credentials;
    await this._service.editUserById(userId, <User>request.payload);

    return {
      status: "success",
      message: "User updated",
    };
  };
}
