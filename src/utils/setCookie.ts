import { CookieOptions, NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { IUser } from "../types/user";
import { _config } from "../config/config";
import { generateAccessAndRefreshToken } from "./generateAccessAndRefreshToken";
import User from "../user/userModel";

type Cookie = {
  user: IUser;
  res: Response;
  next: NextFunction;
  message: string;
  statusCode: number;
};

const setCookie = async ({ message, next, res, statusCode, user }: Cookie) => {
  try {
    const { access_token, refresh_token } = await generateAccessAndRefreshToken(
      user._id.toString()
    );

    const userToLogin = await User.findById(user._id).select(
      "-password -salt -reset_password_token -reset_token_expiry -verify_email_token -refresh_token"
    );

    const access_expiry = new Date(Date.now() + 1000 * 60 * 60);
    const refresh_expiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    const options: CookieOptions = {
      httpOnly: true,
      sameSite: _config.nodeEnv === "development" ? "strict" : "none",
      secure: true,
    };

    res
      .status(statusCode)
      .cookie("_linklite_access", access_token, {
        ...options,
        expires: access_expiry,
      })
      .cookie("_linklite_refresh", refresh_token, {
        ...options,
        expires: refresh_expiry,
      })
      .json({
        success: true,
        message,
        access_token,
        refresh_token,
        access_expiry,
        refresh_expiry,
        user: userToLogin,
      });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error ? err.message : "An unknown error occurred"
    );
    next(error);
  }
};

export default setCookie;
