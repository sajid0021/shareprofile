import { Router } from "express";

import authMiddleware from "../../middleware/auth.js";
import { getMessagesController, sendMessageController } from "./message.controller.js";

const router = Router();

router.get("/:userId", authMiddleware, getMessagesController);
router.post("/", authMiddleware, sendMessageController);

export default router;
