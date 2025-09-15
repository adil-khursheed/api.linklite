import mongoose from "mongoose";

export interface IWorkspaceProps {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  logo: {
    key: string | null;
    url: string | null;
  };
  plan: "free" | "pro" | "premium";
  members: [mongoose.Types.ObjectId];
  members_limit: number;
  short_links_limit: number;
  links_created: number;
  total_links: number;
  custom_domain_limit: number;
  domains_created: number;
  total_clicks: number;
  clicks_limit: number;
  billing_cycle_start: number;
  created_by: mongoose.Types.ObjectId;
  invite_code: string;
  tags_limit: number;
  folders_limit: number;
  folders_created: number;
  created_at: Date;
  updated_at: Date;
}
