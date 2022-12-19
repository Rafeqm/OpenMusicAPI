import { Lifecycle } from "@hapi/hapi";
import { User } from "@prisma/client";

import UsersService from "../../services/database/UsersService";
import usersPayloadValidator from "../../validator/users";

export default class UsersHandler {
  constructor(
    private readonly _service: UsersService,
    private readonly _validator: typeof usersPayloadValidator
  ) {}

  postUser: Lifecycle.Method = async (request, h) => {
    await this._validator.validate(request.payload);

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
}
