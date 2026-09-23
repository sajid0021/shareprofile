import { z } from "zod";

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must contain at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can contain letters, numbers, - and _"),

  firstName: z.string().min(2, "First name is required").max(50),

  lastName: z.string().min(1, "Last name is required").max(50),

  headline: z.string().min(5, "Headline is required").max(120),

  about: z.string().max(2000, "About section cannot exceed 2000 characters"),

  city: z.string().min(2, "City is required").max(100),

  state: z.string().min(2, "State is required").max(100),

  country: z.string().min(2, "Country is required").max(100),

  email: z.string().email("Enter a valid email address"),

  phone: z.string().optional().or(z.literal("")),

  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),

  profileImage: z.string().optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
