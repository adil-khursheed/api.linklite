import mongoose, { Schema } from "mongoose";
import { IWorkspaceProps } from "../types/workspace";

const workspaceSchema = new Schema<IWorkspaceProps>({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  members: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  members_limit: {
    type: Number,
    default: 1,
  },
  short_links_limit: {
    type: Number,
    default: 30,
  },
  links_created: {
    type: Number,
    default: 0,
  },
  custom_domain_limit: {
    type: Number,
    default: 3,
  },
  domains_created: {
    type: Number,
    default: 0,
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
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

const Workspace = mongoose.model<IWorkspaceProps>("Workspace", workspaceSchema);

export default Workspace;
