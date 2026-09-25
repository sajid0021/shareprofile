import mongoose from "mongoose";

import User from "../auth/model.js";
import Profile from "../profile/model.js";
import { Connection, Invitation } from "./network.model.js";
import { toConnectionResponse, toInvitationResponse, toNetworkUser } from "./network.dto.js";

function normalizePair(userId, otherUserId) {
  const [userA, userB] = [userId.toString(), otherUserId.toString()].sort();

  return {
    userA: new mongoose.Types.ObjectId(userA),
    userB: new mongoose.Types.ObjectId(userB),
  };
}

async function getNetworkUser(user) {
  if (!user) {
    return null;
  }

  const profile = await Profile.findOne({
    userId: user._id,
  }).lean();

  return toNetworkUser(user, profile);
}

export async function sendInvitation(senderId, receiverId) {
  if (!mongoose.isValidObjectId(receiverId)) {
    throw new Error("Invalid receiver.");
  }

  if (senderId.toString() === receiverId.toString()) {
    throw new Error("You cannot send an invitation to yourself.");
  }

  const existingConnection = await findConnection(senderId, receiverId);

  if (existingConnection) {
    throw new Error("You are already connected.");
  }

  const existingInvitation = await Invitation.findOne({
    sender: senderId,
    receiver: receiverId,
    status: "pending",
  });

  if (existingInvitation) {
    throw new Error("Invitation already sent.");
  }

  const reverseInvitation = await Invitation.findOne({
    sender: receiverId,
    receiver: senderId,
    status: "pending",
  });

  if (reverseInvitation) {
    throw new Error("This user has already sent you an invitation.");
  }

  return Invitation.create({
    sender: senderId,
    receiver: receiverId,
    status: "pending",
  });
}

export async function getReceivedInvitations(userId) {
  const invitations = await Invitation.find({
    receiver: userId,
    status: "pending",
  })
    .populate("sender", "firstName lastName email")
    .sort({ createdAt: -1 });

  const receiverUser = await User.findById(userId).lean();
  const receiver = await getNetworkUser(receiverUser);

  return Promise.all(
    invitations.map(async (invitation) => {
      const sender = await getNetworkUser(invitation.sender);

      return toInvitationResponse(invitation, sender, receiver);
    }),
  );
}

export async function getSentInvitations(userId) {
  const invitations = await Invitation.find({
    sender: userId,
    status: "pending",
  })
    .populate("receiver", "firstName lastName email")
    .sort({ createdAt: -1 });

  const senderUser = await User.findById(userId).lean();
  const sender = await getNetworkUser(senderUser);

  return Promise.all(
    invitations.map(async (invitation) => {
      const receiver = await getNetworkUser(invitation.receiver);

      return toInvitationResponse(invitation, sender, receiver);
    }),
  );
}

export async function acceptInvitation(userId, invitationId) {
  if (!mongoose.isValidObjectId(invitationId)) {
    throw new Error("Invalid invitation.");
  }

  const invitation = await Invitation.findOne({
    _id: invitationId,
    receiver: userId,
    status: "pending",
  });

  if (!invitation) {
    throw new Error("Invitation not found.");
  }

  const connectionPair = normalizePair(invitation.sender, invitation.receiver);

  await Connection.create(connectionPair);

  invitation.status = "accepted";
  invitation.respondedAt = new Date();

  await invitation.save();

  return invitation;
}

export async function rejectInvitation(userId, invitationId) {
  if (!mongoose.isValidObjectId(invitationId)) {
    throw new Error("Invalid invitation.");
  }

  const invitation = await Invitation.findOne({
    _id: invitationId,
    receiver: userId,
    status: "pending",
  });

  if (!invitation) {
    throw new Error("Invitation not found.");
  }

  invitation.status = "rejected";
  invitation.respondedAt = new Date();

  await invitation.save();

  return invitation;
}

export async function getConnections(userId) {
  const connections = await Connection.find({
    $or: [{ userA: userId }, { userB: userId }],
  })
    .populate("userA", "firstName lastName email")
    .populate("userB", "firstName lastName email")
    .sort({ connectedAt: -1 });

  return Promise.all(
    connections.map(async (connection) => {
      const currentUserId = userId.toString();

      const otherUser =
        connection.userA._id.toString() === currentUserId ? connection.userB : connection.userA;

      const networkUser = await getNetworkUser(otherUser);

      return toConnectionResponse(connection, networkUser);
    }),
  );
}

async function findConnection(userId, otherUserId) {
  const { userA, userB } = normalizePair(userId, otherUserId);

  return Connection.findOne({
    userA,
    userB,
  });
}
