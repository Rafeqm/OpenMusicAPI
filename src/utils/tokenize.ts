/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { badRequest } from "@hapi/boom";
import Jwt from "@hapi/jwt";
import { Authentication } from "@prisma/client";

export const tokenManager = {
  generateAccessToken: (payload: any): string =>
    Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY!),

  generateRefreshToken: (payload: any): string =>
    Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY!),

  verifyRefreshToken: (token: Authentication["token"]): any => {
    try {
      const artifacts = Jwt.token.decode(token);

      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY!);
      return artifacts.decoded.payload;
    } catch (error) {
      throw badRequest("Invalid refresh token");
    }
  },
};
