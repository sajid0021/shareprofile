import { Router } from "express";

import authMiddleware from "../../middleware/auth.js";
import {
  getMyProfileController,
  getPublicProfileController,
  saveMyProfileController,
  saveMyProfileImageController,
} from "./controller.js";

const router = Router();

router.get("/me", authMiddleware, getMyProfileController);
router.put("/me", authMiddleware, saveMyProfileController);
router.put("/me/image", authMiddleware, saveMyProfileImageController);
router.get("/public/:username", getPublicProfileController);

export default router;
