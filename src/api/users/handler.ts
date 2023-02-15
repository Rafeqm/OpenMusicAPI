import { Lifecycle } from "@hapi/hapi";
import { User } from "@prisma/client";
import path from "path";

import UsersService from "../../services/database/UsersService";
import UsersStorageService from "../../services/storage/UsersStorageService";
import uploadsValidator from "../../validator/uploads";
import usersValidator from "../../validator/users";

export default class UsersHandler {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _storageService: UsersStorageService,
    private readonly _usersValidator: typeof usersValidator,
    private readonly _uploadsValidator: typeof uploadsValidator
  ) {}

  postUser: Lifecycle.Method = async (request, h) => {
    await this._usersValidator.validatePostUserPayload(request.payload);

    const userId = await this._usersService.addUser(<User>request.payload);

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
    const { users, source } = await this._usersService.getUsers(
      username,
      fullname
    );

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
    const { user, source } = await this._usersService.getUserById(id);

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
    await this._usersValidator.validatePutUserPayload(request.payload);

    const { userId } = <any>request.auth.credentials;
    await this._usersService.editUserById(userId, <User>request.payload);

    return {
      status: "success",
      message: "User updated",
    };
  };

  postUserAvatarById: Lifecycle.Method = async (request, h) => {
    const { avatar } = <any>request.payload;
    await this._uploadsValidator.validateImageHeaders(avatar.hapi.headers);

    const { userId } = <any>request.auth.credentials;
    const filename = await this._usersService.getUserAvatarById(userId);
    await this._storageService.removeUserAvatar(filename);

    const extname = path.extname(avatar.hapi.filename);
    const fileLocation = await this._storageService.uploadUserAvatar({
      content: avatar,
      contentType: avatar.hapi.headers["content-type"],
      filename: userId + extname,
    });

    let avatarUrl: string;
    try {
      avatarUrl = new URL(fileLocation).toString();
    } catch {
      avatarUrl = `${request.url.origin}/users/${userId}/avatar`;
    }

    await this._usersService.updateUserAvatarById(userId, avatarUrl, extname);

    return h
      .response({
        status: "success",
        message: "User avatar uploaded",
      })
      .code(201);
  };

  getUserAvatarById: Lifecycle.Method = async (request, h) => {
    const { id } = <User>request.params;
    const filename = await this._usersService.getUserAvatarById(id);
    const filePath = this._storageService.getAvatarFilePath(filename);

    return h.file(filePath);
  };

  deleteUserAvatarById: Lifecycle.Method = async (request) => {
    const { userId } = <any>request.auth.credentials;
    const filename = await this._usersService.deleteUserAvatarById(userId);
    await this._storageService.removeUserAvatar(filename);

    return {
      status: "success",
      message: "User avatar removed",
    };
  };
}
