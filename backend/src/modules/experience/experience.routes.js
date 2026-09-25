import express from "express";
import {
  createExperience,
  deleteExperience,
  getExperienceById,
  getMyExperiences,
  updateExperience,
} from "./experience.controller.js";
import authMiddleware from "../../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getMyExperiences);
router.post("/", authMiddleware, createExperience);
router.get("/:id", authMiddleware, getExperienceById);
router.put("/:id", authMiddleware, updateExperience);
router.delete("/:id", authMiddleware, deleteExperience);

export default router;
