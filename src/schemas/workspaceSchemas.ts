import { z } from "zod";

export const inviteMemberSchema = z.object({
  emails: z
    .array(z.email({ error: "Invalid email address" }))
    .min(1, { error: "At least one email is required" }),
});
