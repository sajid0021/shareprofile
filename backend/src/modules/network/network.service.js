import mongoose from "mongoose";

import { isMongoReady } from "../../config/database.js";
import User from "../auth/model.js";
import Profile from "../profile/model.js";
import { getDevUsers } from "../auth/service.js";
import { getProfileForUser } from "../profile/service.js";
import { Connection, Invitation } from "./network.model.js";
import { toConnectionResponse, toInvitationResponse, toNetworkUser } from "./network.dto.js";

const developmentInvitations = new Map();
const developmentConnections = new Map();

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
  if (!isMongoReady()) {
    if (senderId === receiverId) {
      throw new Error("You cannot send an invitation to yourself.");
    }

    const invitationKey = `${senderId}:${receiverId}`;
    const reverseInvitationKey = `${receiverId}:${senderId}`;

    if (developmentInvitations.has(invitationKey)) {
      throw new Error("Invitation already sent.");
    }

    if (developmentInvitations.has(reverseInvitationKey)) {
      throw new Error("This user has already sent you an invitation.");
    }

    developmentInvitations.set(invitationKey, {
      id: `dev-invitation-${Date.now()}`,
      sender: senderId,
      receiver: receiverId,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return developmentInvitations.get(invitationKey);
  }

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
  if (!isMongoReady()) {
    const receiver = await getDevelopmentNetworkUser(userId);
    const invitations = [...developmentInvitations.values()]
      .filter((invitation) => invitation.receiver === userId && invitation.status === "pending")
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));

    return Promise.all(
      invitations.map(async (invitation) => ({
        ...invitation,
        sender: await getDevelopmentNetworkUser(invitation.sender),
        receiver,
      })),
    );
  }

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
  if (!isMongoReady()) {
    const sender = await getDevelopmentNetworkUser(userId);
    const invitations = [...developmentInvitations.values()]
      .filter((invitation) => invitation.sender === userId && invitation.status === "pending")
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));

    return Promise.all(
      invitations.map(async (invitation) => ({
        ...invitation,
        sender,
        receiver: await getDevelopmentNetworkUser(invitation.receiver),
      })),
    );
  }

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
  if (!isMongoReady()) {
    const invitation = [...developmentInvitations.values()].find(
      (item) => item.id === invitationId && item.receiver === userId && item.status === "pending",
    );

    if (!invitation) {
      throw new Error("Invitation not found.");
    }

    invitation.status = "accepted";
    invitation.respondedAt = new Date().toISOString();
    developmentConnections.set(
      [invitation.sender, invitation.receiver].sort().join(":"),
      {
        id: `dev-connection-${Date.now()}`,
        userA: invitation.sender,
        userB: invitation.receiver,
        connectedAt: invitation.respondedAt,
      },
    );

    return invitation;
  }

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
  if (!isMongoReady()) {
    const invitation = [...developmentInvitations.values()].find(
      (item) => item.id === invitationId && item.receiver === userId && item.status === "pending",
    );

    if (!invitation) {
      throw new Error("Invitation not found.");
    }

    invitation.status = "rejected";
    invitation.respondedAt = new Date().toISOString();
    return invitation;
  }

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
  if (!isMongoReady()) {
    const connections = [...developmentConnections.values()].filter(
      (connection) => connection.userA === userId || connection.userB === userId,
    );

    return Promise.all(
      connections.map(async (connection) => {
        const otherUserId = connection.userA === userId ? connection.userB : connection.userA;
        return {
          ...connection,
          user: await getDevelopmentNetworkUser(otherUserId),
        };
      }),
    );
  }

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

export async function searchNetworkUsers(userId, query) {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  if (mongoose.connection.readyState === 1) {
    const pattern = new RegExp(normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const users = await User.find({
      _id: { $ne: userId },
      $or: [{ firstName: pattern }, { lastName: pattern }, { email: pattern }],
    })
      .select("firstName lastName email")
      .limit(20)
      .lean();

    return Promise.all(
      users.map(async (user) => {
        const networkUser = await getNetworkUser(user);
        const status = await getRelationshipStatus(userId, user._id);

        return { ...networkUser, relationshipStatus: status };
      }),
    );
  }

  const users = getDevUsers().filter((user) => {
    if (user.id === userId) return false;

    const value = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();
    return value.includes(normalizedQuery.toLowerCase());
  });

  return Promise.all(
    users.slice(0, 20).map(async (user) => ({
      ...(await getProfileForUser(user.id)),
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      relationshipStatus: "available",
    })),
  );
}

async function findConnection(userId, otherUserId) {
  const { userA, userB } = normalizePair(userId, otherUserId);

  return Connection.findOne({
    userA,
    userB,
  });
}

export async function areUsersConnected(userId, otherUserId) {
  if (!isMongoReady()) {
    const pairKey = [userId, otherUserId].sort().join(":");
    return developmentConnections.has(pairKey);
  }

  return Boolean(await findConnection(userId, otherUserId));
}

async function getRelationshipStatus(userId, otherUserId) {
  if (!isMongoReady()) {
    if (developmentInvitations.has(`${userId}:${otherUserId}`)) return "pending";
    if (developmentInvitations.has(`${otherUserId}:${userId}`)) return "received";
    return "available";
  }

  if (await findConnection(userId, otherUserId)) {
    return "connected";
  }

  const [sentInvitation, receivedInvitation] = await Promise.all([
    Invitation.exists({
      sender: userId,
      receiver: otherUserId,
      status: "pending",
    }),
    Invitation.exists({
      sender: otherUserId,
      receiver: userId,
      status: "pending",
    }),
  ]);

  if (sentInvitation) return "pending";
  if (receivedInvitation) return "received";
  return "available";
}

async function getDevelopmentNetworkUser(userId) {
  const user = getDevUsers().find((item) => item.id === userId);

  if (!user) {
    return null;
  }

  const profile = await getProfileForUser(userId);

  return {
    id: user.id,
    username: profile?.username || "",
    firstName: user.firstName,
    lastName: user.lastName,
    headline: profile?.headline || "",
    about: profile?.about || "",
    profileImage: profile?.profileImage || "",
    location: [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", "),
    city: profile?.city || "",
    state: profile?.state || "",
    country: profile?.country || "",
    email: profile?.email || user.email || "",
    phone: profile?.phone || "",
    website: profile?.website || "",
    skills: profile?.skills || [],
  };
}
