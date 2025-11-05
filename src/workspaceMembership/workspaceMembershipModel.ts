import mongoose, { Schema } from "mongoose";
import { TWorkspaceMembership } from "../types/workspaceMembership";

const workspaceMembershipSchema = new Schema<TWorkspaceMembership>({
  workspace_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["ws:owner", "ws:admin", "ws:member"],
    required: true,
  },
  permissions: {
    type: [String],
    required: true,
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

const WorkspaceMembership = mongoose.model<TWorkspaceMembership>(
  "WorkspaceMembership",
  workspaceMembershipSchema
);

export default WorkspaceMembership;
