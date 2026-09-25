import mongoose from "mongoose";
import { z } from "zod";

import Education from "./education.model.js";

const educationSchema = z
  .object({
    institution: z.string().trim().min(2).max(200),
    degree: z.string().trim().min(2).max(150),
    fieldOfStudy: z.string().trim().max(150).optional().default(""),
    startDate: z.string().trim().optional().default(""),
    endDate: z.string().trim().optional().default(""),
    description: z.string().trim().max(3000).optional().default(""),
  })
  .transform((value) => ({
    ...value,
    fieldOfStudy: value.fieldOfStudy || "",
    startDate: value.startDate || "",
    endDate: value.endDate || "",
    description: value.description || "",
  }));

function serializeEducation(education) {
  if (!education) return null;
  const plain = typeof education.toObject === "function" ? education.toObject() : education;
  const { _id, __v, ...rest } = plain;
  return { ...rest, id: String(_id) };
}

function isInvalidObjectId(id) {
  return !mongoose.isValidObjectId(id);
}

export const createEducation = async (req, res) => {
  try {
    const data = educationSchema.parse(req.body);

    const education = await Education.create({
      user: req.user.id,
      ...data,
    });

    return res.status(201).json({
      success: true,
      message: "Education added successfully",
      data: serializeEducation(education),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        errors: error.flatten(),
      });
    }

    console.error("Create education error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add education",
    });
  }
};

export const getMyEducation = async (req, res) => {
  try {
    const education = await Education.find({ user: req.user.id }).sort({ startDate: -1, endDate: -1, createdAt: -1 }).exec();

    const data = education.map((item) => serializeEducation(item));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get education error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load education",
    });
  }
};

export const getEducationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid education ID.",
        code: "INVALID_ID",
      });
    }

    const education = await Education.findOne({ _id: id, user: req.user.id }).exec();

    if (!education) {
      return res.status(404).json({
        success: false,
        message: "Education not found.",
      });
    }

    return res.status(200).json({ success: true, data: serializeEducation(education) });
  } catch (error) {
    console.error("Get education by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load education.",
    });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid education ID.",
        code: "INVALID_ID",
      });
    }

    const data = educationSchema.parse(req.body);
    const education = await Education.findOneAndUpdate({ _id: id, user: req.user.id }, data, {
      new: true,
      runValidators: true,
    }).exec();

    if (!education) {
      return res.status(404).json({
        success: false,
        message: "Education not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Education updated successfully.",
      data: serializeEducation(education),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        errors: error.flatten(),
      });
    }

    console.error("Update education error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update education.",
    });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid education ID.",
        code: "INVALID_ID",
      });
    }

    const education = await Education.findOneAndDelete({ _id: id, user: req.user.id }).exec();

    if (!education) {
      return res.status(404).json({
        success: false,
        message: "Education not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Education deleted successfully.",
      data: serializeEducation(education),
    });
  } catch (error) {
    console.error("Delete education error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete education.",
    });
  }
};
