import { CookieOptions, NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";
import crypto from "crypto";
import User from "./userModel";
import setCookie from "../utils/setCookie";
import { emailVerificationQueue } from "../services/bullmq/producer";
import { _config } from "../config/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { generateAccessAndRefreshToken } from "../utils/generateAccessAndRefreshToken";

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
      err instanceof Error
        ? err.message
        : "An unknown error occurred while registering the user"
    );
    return next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { verifyEmailToken } = req.params;
    if (!verifyEmailToken) {
      const error = createHttpError(400, "Verify email token is required");
      return next(error);
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(verifyEmailToken)
      .digest("hex");

    const user = await User.findOne({ verifyEmailToken: hashedToken });
    if (!user) {
      const error = createHttpError(400, "Invalid verify email token");
      return next(error);
    }

    user.email_verified = true;
    user.verifyEmailToken = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verification successful.",
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while verifying the user email"
    );
    return next(error);
  }
};

export const resendEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      const error = createHttpError(404, "User not found");
      return next(error);
    }

    if (user.email_verified) {
      const error = createHttpError(400, "Email already verified");
      return next(error);
    }

    const verifyEmailToken = crypto.randomBytes(20).toString("hex");

    user.verifyEmailToken = crypto
      .createHash("sha256")
      .update(verifyEmailToken)
      .digest("hex");

    await user.save();

    await emailVerificationQueue.add("verify_email", {
      options: {
        email: user.email,
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

    res.status(200).json({
      success: true,
      message: "Email verification link sent successfully.",
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while resending the user email"
    );
    return next(error);
  }
};

export const loginUser = async (
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

    const user = await User.findOne({ email });
    if (!user) {
      const error = createHttpError(400, "Invalid email or password");
      return next(error);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = createHttpError(400, "Invalid email or password");
      return next(error);
    }

    setCookie({
      message: "Login successful",
      next,
      res,
      statusCode: 200,
      user,
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while logging in the user"
    );
    return next(error);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      { new: true }
    );

    const options: CookieOptions = {
      httpOnly: true,
      sameSite: _config.nodeEnv === "development" ? "strict" : "none",
      secure: true,
    };

    res
      .status(200)
      .clearCookie("_linklite_access", options)
      .clearCookie("_linklite_refresh", options)
      .json({
        success: true,
        message: "Logout successful",
      });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while logging out the user"
    );
    return next(error);
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const incomingRefreshToken =
      req.cookies._linklite_refresh || req.body._linklite_refresh;

    if (!incomingRefreshToken) {
      const error = createHttpError(401, "Unauthorized request");
      return next(error);
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      _config.refresh_token_secret as string
    ) as JwtPayload;

    const user = await User.findById(decodedToken?.id);

    if (!user) {
      const error = createHttpError(401, "Unauthorized request");
      return next(error);
    }

    if (incomingRefreshToken !== user.refreshToken) {
      const error = createHttpError(401, "Refresh token is expired or used");
      return next(error);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id.toString()
    );

    const options: CookieOptions = {
      httpOnly: true,
      sameSite: _config.nodeEnv === "development" ? "strict" : "none",
      secure: true,
    };

    res
      .status(200)
      .cookie("_linklite_access", accessToken, options)
      .cookie("_linklite_refresh", refreshToken, options)
      .json({
        success: true,
        message: "Access token refreshed successfully.",
        accessToken,
        refreshToken,
      });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while refreshing the user"
    );
    return next(error);
  }
};
