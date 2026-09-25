import { Router } from "express";

import authMiddleware from "../../middleware/auth.js";
import {
  getMyProfileController,
  getPublicProfileController,
  saveMyProfileController,
  saveMyProfileImageController,
  saveMySkillsController,
} from "./controller.js";

const router = Router();

router.get("/me", authMiddleware, getMyProfileController);
router.put("/me", authMiddleware, saveMyProfileController);
router.put("/me/image", authMiddleware, saveMyProfileImageController);
router.put("/me/skills", authMiddleware, saveMySkillsController);
router.get("/public/:username", getPublicProfileController);

export default router;
