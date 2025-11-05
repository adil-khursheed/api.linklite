import mongoose from "mongoose";

type Role = "ws:owner" | "ws:admin" | "ws:member";

type Permission =
  // workspace permissions
  | "ws:update"
  | "ws:delete"
  | "ws:manage_billing"
  | "ws:view_settings"

  // member permissions
  | "ws:members:invite"
  | "ws:members:remove"
  | "ws:members:update_role"
  | "ws:members:view"

  // link permissions
  | "ws:links:create"
  | "ws:links:update"
  | "ws:links:delete"
  | "ws:links:view"
  | "ws:links:delete"

  // tags permissions
  | "ws:tags:create"
  | "ws:tags:update"
  | "ws:tags:delete"
  | "ws:tags:view";

type TWorkspaceMembership = {
  _id: mongoose.Types.ObjectId;
  workspace_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  role: Role;
  permissions: Permission[];
  created_at: Date;
  updated_at: Date;
};
