import mongoose, { Schema } from "mongoose";
import { TTag } from "../types/tag";

const tagSchema = new Schema<TTag>({
  name: {
    type: String,
    required: true,
  },
  workspace_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
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

const Tag = mongoose.model<TTag>("Tag", tagSchema);

export default Tag;
