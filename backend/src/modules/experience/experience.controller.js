import { z } from "zod";
import Experience from "./experience.model.js";

const experienceSchema = z
  .object({
    company: z.string().min(2).max(150),
    position: z.string().min(2).max(150),
    location: z.string().max(150).optional(),
    startDate: z.string().min(1),
    endDate: z.string().optional(),
    current: z.boolean().default(false),
    description: z.string().min(10).max(3000),
  })
  .refine((data) => data.current || Boolean(data.endDate), {
    message: "End date is required when this is not a current job",
    path: ["endDate"],
  });

export const createExperience = async (req, res) => {
  try {
    const data = experienceSchema.parse(req.body);

    // The user ID comes from authentication, not from the request body.
    const experience = await Experience.create({
      user: req.user.id,
      ...data,
    });

    return res.status(201).json({
      success: true,
      message: "Experience added successfully",
      data: experience,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience data",
        errors: error.flatten(),
      });
    }

    console.error("Create experience error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add experience",
    });
  }
};
