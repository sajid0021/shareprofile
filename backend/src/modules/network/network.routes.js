import { Router } from "express";

import authMiddleware from "../../middleware/auth.js";
import {
  sendInvitationController,
  getReceivedInvitationsController,
  getSentInvitationsController,
  acceptInvitationController,
  rejectInvitationController,
  getConnectionsController,
  searchNetworkUsersController,
} from "./network.controller.js";

const router = Router();

router.post("/invitations", authMiddleware, sendInvitationController);

router.get("/invitations/received", authMiddleware, getReceivedInvitationsController);

router.get("/invitations/sent", authMiddleware, getSentInvitationsController);

router.patch("/invitations/:id/accept", authMiddleware, acceptInvitationController);

router.patch("/invitations/:id/reject", authMiddleware, rejectInvitationController);

router.get("/connections", authMiddleware, getConnectionsController);

router.get("/search", authMiddleware, searchNetworkUsersController);

export default router;
