import mongoose from "mongoose";

import { isMongoReady } from "../../config/database.js";
import User from "../auth/model.js";
import { getDevUsers } from "../auth/service.js";
import { areUsersConnected } from "../network/network.service.js";
import Message from "./message.model.js";

const developmentMessages = [];

function normalizeMessage(message) {
  return {
    id: message._id?.toString() || message.id,
    senderId: message.sender?.toString() || message.senderId,
    receiverId: message.receiver?.toString() || message.receiverId,
    body: message.body,
    createdAt: message.createdAt,
  };
}

export async function getMessages(userId, otherUserId) {
  if (!mongoose.isValidObjectId(userId) && isMongoReady()) {
    throw new Error("Invalid user.");
  }

  if (!(await areUsersConnected(userId, otherUserId))) {
    throw new Error("You can message connections only.");
  }

  if (isMongoReady()) {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    return messages.map(normalizeMessage);
  }

  return developmentMessages
    .filter(
      (message) =>
        (message.senderId === userId && message.receiverId === otherUserId) ||
        (message.senderId === otherUserId && message.receiverId === userId),
    )
    .map(normalizeMessage);
}

export async function sendMessage(senderId, receiverId, body) {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    throw new Error("Message cannot be empty.");
  }

  if (!(await areUsersConnected(senderId, receiverId))) {
    throw new Error("You can message connections only.");
  }

  if (isMongoReady()) {
    if (!mongoose.isValidObjectId(receiverId)) {
      throw new Error("Invalid recipient.");
    }

    return normalizeMessage(
      await Message.create({
        sender: senderId,
        receiver: receiverId,
        body: trimmedBody,
      }),
    );
  }

  const senderExists = getDevUsers().some((user) => user.id === senderId);
  const receiverExists = getDevUsers().some((user) => user.id === receiverId);

  if (!senderExists || !receiverExists) {
    throw new Error("User not found.");
  }

  const message = {
    id: `dev-message-${Date.now()}-${developmentMessages.length}`,
    senderId,
    receiverId,
    body: trimmedBody,
    createdAt: new Date().toISOString(),
  };

  developmentMessages.push(message);
  return normalizeMessage(message);
}
