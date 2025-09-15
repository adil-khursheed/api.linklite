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
  logo: {
    key: {
      type: String,
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
  },
  plan: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
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
  tags_limit: {
    type: Number,
    default: 5,
  },
  folders_limit: {
    type: Number,
    default: 0,
  },
  folders_created: {
    type: Number,
    default: 0,
  },
  total_clicks: {
    type: Number,
    default: 0,
  },
  clicks_limit: {
    type: Number,
    default: 1000,
  },
  billing_cycle_start: {
    type: Number,
    default: 0,
  },
  invite_code: {
    type: String,
    required: true,
    unique: true,
  },
  total_links: {
    type: Number,
    default: 0,
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
