import mongoose from "mongoose";

interface IUser {
  _id: mongoose.Types.ObjectId;
  display_name: string;
  account_name: string;
  email: string;
  password: string | null;
  salt: string | null;
  email_verified: boolean;
  verify_email_token: string | null;
  category: string;
  short_links_limit: number;
  reset_password_token: string | null;
  reset_token_expiry: Date | null;
  refresh_token: string;
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
  | "reset_password_token"
  | "reset_token_expiry"
  | "verify_email_token"
  | "refresh_token"
>;
