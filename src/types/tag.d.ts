import mongoose from "mongoose";

type TTag = {
  _id: mongoose.Types.ObjectId;
  name: string;
  workspace_id: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
};
