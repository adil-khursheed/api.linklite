import mongoose, { Schema } from "mongoose";
import { TUrl } from "../types/url";

const urlSchema = new Schema<TUrl>({
  workspace_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  short_link_id: {
    type: String,
    required: true,
    unique: true,
  },
  destination_url: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],
  comment: {
    type: String,
    default: null,
  },
  link_metadata: {
    title: { type: String, default: null },
    description: { type: String, default: null },
    favicon: { type: String, default: null },
    og_image: { type: String, default: null },
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
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

const Url = mongoose.model<TUrl>("Url", urlSchema);

export default Url;
