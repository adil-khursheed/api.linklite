import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";
import User from "./userModel";
import setCookie from "../utils/setCookie";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if ([email, password].some((item) => item.trim() === "")) {
      const error = createHttpError(400, "Email and password are required");
      return next(error);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = createHttpError(400, "Email already registered");
      return next(error);
    }

    const user = await User.create({
      email,
      password,
      displayName: nanoid(12),
    });

    setCookie({
      message: "Registration successful",
      next,
      res,
      statusCode: 201,
      user,
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error ? err.message : "An unknown error occurred"
    );
    return next(error);
  }
};
