import mongoose from "mongoose";

type TUrl = {
  _id: string;
  userId: mongoose.Types.ObjectId;
  shortLinkId: string;
  originalLink: string;
  clicksHistory: Array<{ timeStamp: Date }>;
  createdAt: Date;
  updatedAt: Date;
};
