import { z } from "zod";

export const inviteMemberSchema = z.object({
  emails: z
    .array(
      z.object({
        email: z.email({ error: "Invalid email address" }),
        role: z.enum(["ws:admin", "ws:member"], { error: "Invalid role type" }),
      })
    )
    .min(1, { error: "At least one email is required" }),
});
