import mongoose, { Schema } from "mongoose";
import { TUrl } from "../types/url";

const urlSchema = new Schema<TUrl>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shortLinkId: {
      type: String,
      required: true,
      unique: true,
    },
    originalLink: {
      type: String,
      required: true,
    },
    clicksHistory: [
      {
        timeStamp: Date,
      },
    ],
  },
  { timestamps: true }
);

const Url = mongoose.model<TUrl>("Url", urlSchema);

export default Url;
