import mongoose from "mongoose";
import { z } from "zod";
import Experience from "./experience.model.js";

const experienceSchema = z
  .object({
    company: z.string().trim().min(2).max(150),
    position: z.string().trim().min(2).max(150),
    location: z.string().trim().max(150).optional().default(""),
    startDate: z.string().trim().min(1),
    endDate: z.string().trim().optional().default(""),
    current: z.boolean().default(false),
    description: z.string().trim().min(10).max(3000),
  })
  .refine((data) => data.current || Boolean(data.endDate), {
    message: "End date is required when this is not a current job",
    path: ["endDate"],
  });

function serializeExperience(experience) {
  if (!experience) return null;
  const plain = typeof experience.toObject === "function" ? experience.toObject() : experience;
  const { _id, __v, ...rest } = plain;
  return { ...rest, id: String(_id) };
}

function isInvalidObjectId(id) {
  return !mongoose.isValidObjectId(id);
}

export const createExperience = async (req, res) => {
  try {
    const data = experienceSchema.parse(req.body);

    const experience = await Experience.create({
      user: req.user.id,
      ...data,
    });

    return res.status(201).json({
      success: true,
      message: "Experience added successfully",
      data: serializeExperience(experience),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience data",
        code: "VALIDATION_ERROR",
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

export const getMyExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({ user: req.user.id })
      .sort({ current: -1, startDate: -1, createdAt: -1 })
      .exec();

    const data = experiences.map((experience) => serializeExperience(experience));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get experiences error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load experiences",
    });
  }
};

export const getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience ID.",
        code: "INVALID_ID",
      });
    }

    const experience = await Experience.findOne({ _id: id, user: req.user.id }).exec();

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found.",
      });
    }

    return res.status(200).json({ success: true, data: serializeExperience(experience) });
  } catch (error) {
    console.error("Get experience by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load experience.",
    });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience ID.",
        code: "INVALID_ID",
      });
    }

    const data = experienceSchema.parse(req.body);
    const experience = await Experience.findOneAndUpdate({ _id: id, user: req.user.id }, data, {
      new: true,
      runValidators: true,
    }).exec();

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Experience updated successfully.",
      data: serializeExperience(experience),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience data",
        code: "VALIDATION_ERROR",
        errors: error.flatten(),
      });
    }

    console.error("Update experience error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update experience.",
    });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience ID.",
        code: "INVALID_ID",
      });
    }

    const experience = await Experience.findOneAndDelete({ _id: id, user: req.user.id }).exec();

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Experience deleted successfully.",
      data: serializeExperience(experience),
    });
  } catch (error) {
    console.error("Delete experience error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete experience.",
    });
  }
};
