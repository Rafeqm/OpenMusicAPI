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
    await this._validator.validateUserPayload(request.payload);

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

  getUsers: Lifecycle.Method = async (request) => {
    const { username, fullname } = <User>request.query;
    const users = await this._service.getUsers(username, fullname);

    return {
      status: "success",
      data: {
        users,
      },
    };
  };

  getUserById: Lifecycle.Method = async (request) => {
    const { id } = <User>request.params;
    const user = await this._service.getUserById(id);

    return {
      status: "success",
      data: {
        user,
      },
    };
  };
}
