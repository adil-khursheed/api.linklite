import mongoose from "mongoose";

type TLinkMetadata = {
  title: string | null;
  description: string | null;
  favicon: string | null;
  og_image: string | null;
};

type TUrl = {
  _id: string;
  workspace_id: mongoose.Types.ObjectId;
  created_by: mongoose.Types.ObjectId;
  domain: string;
  short_link_id: string;
  destination_url: string;
  total_clicks: number;
  tags: [mongoose.Types.ObjectId];
  comment: string | null;
  link_metadata: TLinkMetadata;
  folder: mongoose.Types.ObjectId | null;
  created_at: Date;
  updated_at: Date;
};
