import mongoose from "mongoose";

interface IUser {
  _id: mongoose.Types.ObjectId;
  display_name: string;
  email: string;
  avatar: {
    key: string | null;
    url: string | null;
  };
  password: string | null;
  salt: string | null;
  email_verified: boolean;
  verify_email_otp: string | null;
  email_otp_expiry: Date | null;
  workspace_limit: number;
  default_workspace: string | null;
  onboarded: boolean;
  reset_password_token: string | null;
  reset_token_expiry: Date | null;
  refresh_token: string;
  created_at: Date;
  updated_at: Date;
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
