import express from "express";
import { createExperience } from "./experience.controller.js";
import authMiddleware from "../../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createExperience);

export default router;
