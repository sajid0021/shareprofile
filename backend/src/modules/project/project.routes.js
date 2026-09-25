import express from "express";

import authMiddleware from "../../middleware/auth.js";
import {
  createProject,
  deleteProject,
  getMyProjects,
  getProjectById,
  updateProject,
} from "./project.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getMyProjects);
router.post("/", authMiddleware, createProject);
router.get("/:id", authMiddleware, getProjectById);
router.put("/:id", authMiddleware, updateProject);
router.delete("/:id", authMiddleware, deleteProject);

export default router;
