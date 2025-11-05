/* eslint-disable @typescript-eslint/no-namespace */

import jwt, { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { NextFunction, Request, Response } from "express";
import { _config } from "../config/config";
import User from "../user/userModel";
import { TUser } from "../types/user";

declare global {
  namespace Express {
    interface Request {
      user?: TUser;
    }
  }
}

export const checkAuth = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies._linklite_access || req.headers.authorization?.split(" ")[1];

    if (!token) {
      const error = createHttpError(401, "Unauthorized request");
      return next(error);
    }

    const decodedToken = jwt.verify(
      token,
      _config.access_token_secret as string
    ) as JwtPayload;

    const user = await User.findById(decodedToken?.id).select(
      "-password -salt -reset_password_token -reset_token_expiry -verify_email_token -refresh_token"
    );

    if (!user) {
      const error = createHttpError(401, "Unauthorized request");
      return next(error);
    }

    req.user = user;
    next();
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while verifying authentication"
    );
    return next(error);
  }
};
