import { CookieOptions, NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import crypto from "crypto";
import { promisify } from "util";
import jwt, { JwtPayload } from "jsonwebtoken";
import axios from "axios";

import User from "./userModel";
import setCookie from "../utils/setCookie";
import {
  emailVerificationQueue,
  forgotPasswordQueue,
} from "../services/bullmq/producer";
import { _config } from "../config/config";
import { generateAccessAndRefreshToken } from "../utils/generateAccessAndRefreshToken";

const pbkdf2Async = promisify(crypto.pbkdf2);

export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      const error = createHttpError(400, "Access token is required");
      return next(error);
    }

    const tokenResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`
    );

    const userResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`
    );

    const tokenInfo = tokenResponse.data;
    const userInfo = userResponse.data;

    if (!tokenInfo || !userInfo) {
      const error = createHttpError(401, "Invalid access token");
      return next(error);
    }

    const { email, name } = userInfo;
    if (!email) {
      const error = createHttpError(404, "Email not found");
      return next(error);
    }

    const user = await User.findOne({ email });

    if (user) {
      setCookie({
        message: "Login successful",
        next,
        res,
        statusCode: 200,
        user,
      });
    } else {
      const newUser = await User.create({
        email,
        display_name: name,
        email_verified: true,
      });

      setCookie({
        message: "Registration successful",
        next,
        res,
        statusCode: 200,
        user: newUser,
      });
    }
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

    const verifyEmailOtp = crypto.randomInt(100000, 999999).toString();

    const salt = crypto.randomBytes(16).toString("hex");

    const derivedKey = await pbkdf2Async(password, salt, 1000, 64, "sha512");

    const user = await User.create({
      email,
      password: derivedKey.toString("hex"),
      salt,
      display_name: email.split("@")[0],
      verify_email_otp: crypto
        .createHash("sha256")
        .update(verifyEmailOtp)
        .digest("hex"),
    });

    await emailVerificationQueue.add("verify_email", {
      options: {
        email,
        subject: "Email Verification",
        message: `
          <div>
            <p>Thank you for registering with LinkLite.in</p>
            <p>Your one time password is:</p>
            <p>OTP: ${verifyEmailOtp}</p>
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
    const { verifyEmailOtp } = req.body;
    if (!verifyEmailOtp) {
      const error = createHttpError(400, "Verify email token is required");
      return next(error);
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(verifyEmailOtp)
      .digest("hex");

    const user = await User.findOne({ verify_email_otp: hashedToken });
    if (!user) {
      const error = createHttpError(400, "Invalid verify email token");
      return next(error);
    }

    user.email_verified = true;
    user.verify_email_otp = null;

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

    const verifyEmailOtp = crypto.randomInt(100000, 999999).toString();

    user.verify_email_otp = crypto
      .createHash("sha256")
      .update(verifyEmailOtp)
      .digest("hex");

    await user.save();

    await emailVerificationQueue.add("verify_email", {
      options: {
        email: user.email,
        subject: "Email Verification",
        message: `
          <div>
            <p>Thank you for registering with LinkLite.in</p>
            <p>Your one time password is:</p>
            <p>OTP: ${verifyEmailOtp}</p>
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
          refresh_token: 1,
        },
      },
      { new: true }
    );

    res
      .status(200)
      .clearCookie("_linklite_access")
      .clearCookie("_linklite_refresh")
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

    if (incomingRefreshToken !== user.refresh_token) {
      const error = createHttpError(401, "Refresh token is expired or used");
      return next(error);
    }

    const { access_token, refresh_token } = await generateAccessAndRefreshToken(
      user._id.toString()
    );

    const access_expiry = new Date(Date.now() + 1000 * 60 * 60);
    const refresh_expiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    const options: CookieOptions = {
      httpOnly: true,
      sameSite: _config.nodeEnv === "development" ? "strict" : "none",
      secure: true,
    };

    res
      .status(200)
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
        message: "Access token refreshed successfully.",
        access_token,
        refresh_token,
        access_expiry,
        refresh_expiry,
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

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) {
      const error = createHttpError(400, "Email is required");
      return next(error);
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = createHttpError(400, "User not found");
      return next(error);
    }

    const resetPasswordToken = await user.getToken();

    await user.save();

    await forgotPasswordQueue.add("forgot_password", {
      options: {
        email,
        subject: "Reset Password",
        message: `
            <h1 style="font-size:28px;font-weight:700;margin:30px 0;color:#333;">Password Reset Request</h1>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <a href="${_config.frontend_url_1}/reset-password/${resetPasswordToken}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #010001; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you did not request a password reset, please ignore this email.</p>
          `,
      },
    });

    res.status(200).json({
      success: true,
      message: `Reset password link sent to ${email}.`,
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while forgot password"
    );
    return next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resetPasswordToken, password } = req.body;
    if (!resetPasswordToken || !password) {
      const error = createHttpError(
        400,
        "Reset password token and password are required"
      );
      return next(error);
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetPasswordToken)
      .digest("hex");

    const user = await User.findOne({
      reset_password_token: hashedToken,
      reset_token_expiry: {
        $gt: Date.now(),
      },
    });
    if (!user) {
      const error = createHttpError(400, "Invalid reset password token");
      return next(error);
    }

    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(
      password,
      salt,
      1000,
      64,
      "sha512",
      async (err, derivedKey) => {
        if (err) {
          const error = createHttpError(
            500,
            err instanceof Error
              ? err.message
              : "An unknown error occurred while resetting password"
          );
          return next(error);
        }
        user.password = derivedKey.toString("hex");
        user.salt = salt;
        user.reset_password_token = null;
        user.reset_token_expiry = null;

        await user.save();

        res.status(200).json({
          success: true,
          message: "Password reset successfully.",
        });
      }
    );
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while resetting password"
    );
    return next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      const error = createHttpError(
        400,
        "Old password and new password are required"
      );
      return next(error);
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      const error = createHttpError(400, "User not found");
      return next(error);
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      const error = createHttpError(400, "Invalid old password");
      return next(error);
    }

    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(
      newPassword,
      salt,
      1000,
      64,
      "sha512",
      async (err, derivedKey) => {
        if (err) {
          const error = createHttpError(
            500,
            err instanceof Error
              ? err.message
              : "  An unknown error occurred while changing password"
          );
          return next(error);
        }
        user.password = derivedKey.toString("hex");
        user.salt = salt;

        await user.save();

        res.status(200).json({
          success: true,
          message: "Password changed successfully.",
        });
      }
    );
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while changing password"
    );
    return next(error);
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?._id).select(
      "-password -salt -reset_password_token -reset_token_expiry -verify_email_token -refresh_token"
    );
    if (!user) {
      const error = createHttpError(404, "User not found");
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully.",
      user,
    });
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while fetching the user profile"
    );
    return next(error);
  }
};
