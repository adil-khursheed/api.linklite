import mongoose from "mongoose";

type TUrl = {
  _id: string;
  user_id: mongoose.Types.ObjectId;
  short_link_id: string;
  original_link: string;
  clicks_history: Array<{ time_stamp: Date }>;
  createdAt: Date;
  updatedAt: Date;
};
