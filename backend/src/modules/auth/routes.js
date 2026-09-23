import { Router } from "express";

import authMiddleware from "../../middleware/auth.js";
import { loginController, logoutController, meController, registerController } from "./controller.js";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", authMiddleware, meController);
// Logout only clears the cookie, so it must also work after an expired session.
router.post("/logout", logoutController);

export default router;
