import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";
import crypto from "crypto";
import User from "./userModel";
import setCookie from "../utils/setCookie";
import { emailVerificationQueue } from "../services/bullmq/producer";
import { _config } from "../config/config";

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

    const verifyEmailToken = crypto.randomBytes(20).toString("hex");

    const user = await User.create({
      email,
      password,
      displayName: nanoid(12),
      verifyEmailToken: crypto
        .createHash("sha256")
        .update(verifyEmailToken)
        .digest("hex"),
    });

    await emailVerificationQueue.add("verify_email", {
      options: {
        email,
        subject: "Email Verification",
        message: `
          <div>
            <p>Thank you for registering with LinkLite.in</p>
            <p>Please click on the link below to verify your email address:</p>
            <a href="${_config.frontend_url}/verify-email/${verifyEmailToken}">Verify Email</a>
          </div>
        `,
      },
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
