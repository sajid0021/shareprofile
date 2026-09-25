import {
  sendInvitation,
  getReceivedInvitations,
  getSentInvitations,
  acceptInvitation,
  rejectInvitation,
  getConnections,
  searchNetworkUsers,
} from "./network.service.js";

export async function sendInvitationController(req, res) {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required.",
      });
    }

    // The sender is always taken from the authenticated session.
    const invitation = await sendInvitation(req.user.id, receiverId);

    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully.",
      data: invitation,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getReceivedInvitationsController(req, res) {
  try {
    const invitations = await getReceivedInvitations(req.user.id);

    return res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load received invitations.",
    });
  }
}

export async function getSentInvitationsController(req, res) {
  try {
    const invitations = await getSentInvitations(req.user.id);

    return res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load sent invitations.",
    });
  }
}

export async function acceptInvitationController(req, res) {
  try {
    const invitation = await acceptInvitation(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Invitation accepted.",
      data: invitation,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function rejectInvitationController(req, res) {
  try {
    const invitation = await rejectInvitation(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Invitation rejected.",
      data: invitation,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getConnectionsController(req, res) {
  try {
    const connections = await getConnections(req.user.id);

    return res.status(200).json({
      success: true,
      data: connections,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load connections.",
    });
  }
}

export async function searchNetworkUsersController(req, res) {
  try {
    const users = await searchNetworkUsers(req.user.id, String(req.query.q || ""));

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to search users.",
    });
  }
}
