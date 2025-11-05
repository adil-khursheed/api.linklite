import mongoose from "mongoose";

type TWorkspaceInvitation = {
  _id: mongoose.Types.ObjectId;
  workspace_id: mongoose.Types.ObjectId;
  email: string;
  role: "ws:admin" | "ws:member";
  invited_by: mongoose.Types.ObjectId;
  token: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
};
