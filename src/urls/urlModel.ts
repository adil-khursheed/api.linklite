import mongoose, { Schema } from "mongoose";
import { TUrl } from "../types/url";

const urlSchema = new Schema<TUrl>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    short_link_id: {
      type: String,
      required: true,
      unique: true,
    },
    original_link: {
      type: String,
      required: true,
    },
    clicks_history: [
      {
        time_stamp: Date,
      },
    ],
  },
  { timestamps: true }
);

const Url = mongoose.model<TUrl>("Url", urlSchema);

export default Url;
