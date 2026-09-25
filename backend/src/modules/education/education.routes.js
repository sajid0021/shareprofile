import express from "express";

import authMiddleware from "../../middleware/auth.js";
import {
  createEducation,
  deleteEducation,
  getEducationById,
  getMyEducation,
  updateEducation,
} from "./education.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getMyEducation);
router.post("/", authMiddleware, createEducation);
router.get("/:id", authMiddleware, getEducationById);
router.put("/:id", authMiddleware, updateEducation);
router.delete("/:id", authMiddleware, deleteEducation);

export default router;
