import mongoose from "mongoose";

interface IUser {
  _id: mongoose.Types.ObjectId;
  displayName: string;
  email: string;
  password: string;
  salt: string;
  email_verified: boolean;
  verifyEmailToken: string | null;
  category: string;
  resetPasswordToken: string | null;
  resetTokenExpiry: Date | null;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  getToken: () => Promise<string>;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
}

type TUser = Omit<
  IUser,
  | "password"
  | "salt"
  | "resetPasswordToken"
  | "resetTokenExpiry"
  | "verifyEmailToken"
  | "refreshToken"
>;
