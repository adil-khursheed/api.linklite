import mongoose, { Schema } from "mongoose";
import { TWorkspaceMembership } from "../types/workspaceMembership";

const workspaceMembershipSchema = new Schema<TWorkspaceMembership>({
  workspace_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["ws:admin", "ws:member"],
    required: true,
  },
  invited_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "expired", "cancelled"],
    default: "pending",
  },
  expires_at: {
    type: Date,
    required: true,
  },
  accepted_at: {
    type: Date,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

workspaceMembershipSchema.index(
  { workspace_id: 1, email: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

const WorkspaceMembership = mongoose.model<TWorkspaceMembership>(
  "WorkspaceMembership",
  workspaceMembershipSchema
);

export default WorkspaceMembership;
