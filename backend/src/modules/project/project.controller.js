import mongoose from "mongoose";
import { z } from "zod";

import {
  createProjectForUser,
  deleteProjectForUser,
  getProjectForUser,
  getProjectsForUser,
  updateProjectForUser,
} from "./project.service.js";

const projectSchema = z
  .object({
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().min(10).max(3000),
    technologies: z.array(z.string().trim().min(2).max(50)).default([]),
    url: z.string().trim().url().or(z.literal("")).default(""),
    startDate: z.string().trim().default(""),
    endDate: z.string().trim().default(""),
  })
  .transform((value) => ({
    ...value,
    technologies: Array.from(
      new Set(
        value.technologies
          .map((technology) => technology.trim())
          .filter(Boolean)
          .map((technology) => technology.toLowerCase())
          .map((technology) => technology.charAt(0).toUpperCase() + technology.slice(1)),
      ),
    ),
    url: value.url?.trim() || "",
    startDate: value.startDate?.trim() || "",
    endDate: value.endDate?.trim() || "",
  }));

function sendValidationError(res, error) {
  return res.status(400).json({
    success: false,
    message: "Validation failed.",
    code: "VALIDATION_ERROR",
    errors: error.flatten(),
  });
}

function isInvalidObjectId(id) {
  return !mongoose.isValidObjectId(id);
}

export async function createProject(req, res) {
  try {
    const payload = projectSchema.parse(req.body);
    const project = await createProjectForUser(req.user.id, payload);

    return res.status(201).json({
      success: true,
      message: "Project added successfully.",
      data: project,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error);
    }

    console.error("Create project error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add project.",
    });
  }
}

export async function getMyProjects(req, res) {
  try {
    const projects = await getProjectsForUser(req.user.id);
    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load projects.",
    });
  }
}

export async function getProjectById(req, res) {
  try {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
        code: "INVALID_ID",
      });
    }

    const project = await getProjectForUser(req.user.id, id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load project.",
    });
  }
}

export async function updateProject(req, res) {
  try {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
        code: "INVALID_ID",
      });
    }

    const payload = projectSchema.parse(req.body);
    const project = await updateProjectForUser(req.user.id, id, payload);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendValidationError(res, error);
    }

    console.error("Update project error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update project.",
    });
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
        code: "INVALID_ID",
      });
    }

    const project = await deleteProjectForUser(req.user.id, id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
      data: project,
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete project.",
    });
  }
}
