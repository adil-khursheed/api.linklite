import mongoose, { Schema } from "mongoose";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IUser } from "../types/user";
import { _config } from "../config/config";

const userSchema = new Schema<IUser>({
  display_name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    default: null,
  },
  salt: {
    type: String,
    default: null,
  },
  verify_email_otp: {
    type: String,
    default: null,
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  workspace_limit: {
    type: Number,
    default: 2,
  },
  workspaces: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Workspace",
    },
  ],
  onboarded: {
    type: Boolean,
    default: false,
  },
  reset_password_token: {
    type: String,
    default: null,
  },
  reset_token_expiry: {
    type: Date,
    default: null,
  },
  refresh_token: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    const error = createHttpError("Please enter a valid email address");
    return next(error);
  }

  next();
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  try {
    const hashedPassword = await new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        this.salt,
        1000,
        64,
        "sha512",
        (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey.toString("hex"));
        }
      );
    });

    return this.password === hashedPassword;
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error
        ? err.message
        : "An unknown error occurred while comparing the password"
    );
    throw error;
  }
};

userSchema.methods.getToken = async function (): Promise<string> {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.reset_password_token = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.reset_token_expiry = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.generateAccessToken = function () {
  const accessTokenSecret = _config.access_token_secret as string;

  const accessToken = jwt.sign({ id: this._id }, accessTokenSecret, {
    expiresIn: "1h",
  });
  return accessToken;
};

userSchema.methods.generateRefreshToken = function () {
  const refreshTokenSecret = _config.refresh_token_secret as string;

  const refreshToken = jwt.sign({ id: this._id }, refreshTokenSecret, {
    expiresIn: "7d",
  });
  return refreshToken;
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
