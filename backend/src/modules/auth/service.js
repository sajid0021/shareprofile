import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { isMongoConfigured, isMongoReady } from "../../config/database.js";
import User from "./model.js";

const devUsers = new Map();
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || "profile-share-dev-secret";

function ensurePersistentAuthStore() {
  if (process.env.NODE_ENV === "production" && !isMongoConfigured()) {
    throw new Error("Persistent authentication storage is not configured.");
  }
}

function buildUserRecord(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    provider: user.provider || "email",
    createdAt: user.createdAt,
  };
}

export function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      provider: user.provider || "email",
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export async function registerUser({ firstName, lastName, email, password }) {
  ensurePersistentAuthStore();

  const normalizedEmail = email.trim().toLowerCase();

  if (!firstName.trim() || !lastName.trim()) {
    throw new Error("First name and last name are required.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let user;

  if (isMongoConfigured()) {
    if (!isMongoReady()) {
      throw new Error("MongoDB is configured but not connected.");
    }

    if (await User.exists({ email: normalizedEmail })) {
      throw new Error("An account with this email already exists.");
    }

    user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      provider: "email",
    });
  } else {
    if (devUsers.has(normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }

    user = {
      id: `dev-user-${Date.now()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      provider: "email",
      createdAt: new Date().toISOString(),
    };

    devUsers.set(normalizedEmail, user);
  }

  const token = createToken(user);

  return {
    user: buildUserRecord(user),
    token,
  };
}

export async function loginUser({ email, password }) {
  ensurePersistentAuthStore();

  const normalizedEmail = email.trim().toLowerCase();
  const user = isMongoConfigured()
    ? isMongoReady()
      ? await User.findOne({ email: normalizedEmail })
      : null
    : devUsers.get(normalizedEmail);

  if (isMongoConfigured() && !isMongoReady()) {
    throw new Error("MongoDB is configured but not connected.");
  }

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error("Invalid email or password.");
  }

  if (isMongoReady()) {
    user.lastLoginAt = new Date();
    await user.save();
  } else {
    user.lastLoginAt = new Date().toISOString();
  }

  const token = createToken(user);

  return {
    user: buildUserRecord(user),
    token,
  };
}

export function getUserFromToken(token) {
  const payload = jwt.verify(token, JWT_SECRET);

  return {
    id: payload.id,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    provider: payload.provider || "email",
  };
}

export function getDevUsers() {
  return Array.from(devUsers.values()).map(buildUserRecord);
}
