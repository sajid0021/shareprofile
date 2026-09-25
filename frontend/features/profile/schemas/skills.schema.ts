import { z } from "zod";

export const skillSchema = z.object({
  skill: z.string().trim().max(50, "Skill cannot exceed 50 characters"),
});

export type SkillFormValues = z.infer<typeof skillSchema>;
