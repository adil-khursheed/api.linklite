import mongoose from "mongoose";

export interface IWorkspaceProps {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  members: [mongoose.Types.ObjectId];
  members_limit: number;
  short_links_limit: number;
  links_created: number;
  custom_domain_limit: number;
  domains_created: number;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}
