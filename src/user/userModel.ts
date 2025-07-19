import mongoose, { Schema } from "mongoose";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { promisify } from "util";
import { IUser } from "../types/user";
import { _config } from "../config/config";

const pbkdf2Async = promisify(crypto.pbkdf2);

const userSchema = new Schema<IUser>(
  {
    displayName: {
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
      required: true,
    },
    salt: {
      type: String,
      required: true,
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
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(this.email)) {
    const error = createHttpError("Please enter a valid email address");
    return next(error);
  }

  if (!this.isModified("password")) return next();

  try {
    const salt = crypto.randomBytes(16).toString("hex");
    this.salt = salt;

    const derivedKey = await pbkdf2Async(
      this.password,
      salt,
      1000,
      64,
      "sha512"
    );
    this.password = derivedKey.toString("hex");

    next();
  } catch (err) {
    const error = createHttpError(
      500,
      err instanceof Error ? err.message : "An unknown error occurred"
    );
    return next(error);
  }
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
      err instanceof Error ? err.message : "An unknown error occurred"
    );
    throw error;
  }
};

userSchema.methods.getToken = async function (): Promise<string> {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetTokenExpiry = Date.now() + 10 * 60 * 1000;

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
