// Email template types
export type EmailType =
  | "email-verification"
  | "forgot-password"
  | "invite-member"
  | "renew-workspace";

// Template data interface
export interface TemplateData {
  username?: string;
  verificationLink?: string;
  otp?: string;
  resetLink?: string;
  inviteLink?: string;
  workspaceName?: string;
  billingDate?: string;
  expiryDate?: string;
}

type MailOptions = {
  email: string;
  subject: string;
  data: TemplateData;
  type: EmailType;
};
