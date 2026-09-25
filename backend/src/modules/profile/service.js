import { isMongoConfigured, isMongoReady } from "../../config/database.js";
import Profile from "./model.js";

const developmentProfiles = new Map();
const canUseMongo = () => isMongoReady();

function normalizeProfile(payload, userId) {
  return {
    userId,
    username: payload.username.trim().toLowerCase(),
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    headline: payload.headline.trim(),
    about: payload.about?.trim() || "",
    city: payload.city.trim(),
    state: payload.state.trim(),
    country: payload.country.trim(),
    email: payload.accountEmail.trim().toLowerCase(),
    phone: payload.phone?.trim() || "",
    website: payload.website?.trim() || "",
    skills: payload.skills || [],
  };
}

function createUsername(accountEmail, userId) {
  return `${accountEmail.split("@")[0]}-${userId.slice(-6)}`
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-");
}

export async function createProfileForUser(userId, accountEmail, names) {
  const profile = {
    userId,
    username: createUsername(accountEmail, userId),
    firstName: names.firstName.trim(),
    lastName: names.lastName.trim(),
    headline: "",
    about: "",
    city: "",
    state: "",
    country: "",
    email: accountEmail.trim().toLowerCase(),
    skills: [],
  };

  if (canUseMongo()) {
    return withoutStorageFields(await Profile.create(profile));
  }

  developmentProfiles.set(userId, profile);
  return withoutStorageFields(profile);
}

function withoutStorageFields(profile) {
  if (!profile) return null;
  const plain = typeof profile.toObject === "function" ? profile.toObject() : profile;
  const { _id, __v, userId, createdAt, updatedAt, ...publicProfile } = plain;
  return { ...publicProfile, id: String(_id || userId) };
}

export async function getProfileForUser(userId) {
  if (isMongoConfigured() && !canUseMongo()) {
    throw new Error("MongoDB is configured but not connected.");
  }

  if (canUseMongo()) {
    return withoutStorageFields(await Profile.findOne({ userId }).lean());
  }

  return withoutStorageFields(developmentProfiles.get(userId));
}

export async function saveProfileForUser(userId, accountEmail, payload) {
  const profile = normalizeProfile({ ...payload, accountEmail }, userId);

  if (isMongoConfigured() && !canUseMongo()) {
    throw new Error("MongoDB is configured but not connected.");
  }

  if (canUseMongo()) {
    const saved = await Profile.findOneAndUpdate({ userId }, profile, {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });
    return withoutStorageFields(saved);
  }

  const conflictingProfile = Array.from(developmentProfiles.values()).find(
    (item) => item.username === profile.username && item.userId !== userId,
  );

  if (conflictingProfile) {
    throw new Error("That username is already in use.");
  }

  developmentProfiles.set(userId, profile);
  return withoutStorageFields(profile);
}

export async function saveProfileImageForUser(userId, profileImage) {
  if (isMongoConfigured() && !canUseMongo()) {
    throw new Error("MongoDB is configured but not connected.");
  }

  if (canUseMongo()) {
    const saved = await Profile.findOneAndUpdate(
      { userId },
      { $set: { profileImage } },
      { returnDocument: "after", runValidators: true },
    );
    return withoutStorageFields(saved);
  }

  const profile = developmentProfiles.get(userId);
  if (!profile) {
    throw new Error("Profile not found.");
  }

  profile.profileImage = profileImage;
  developmentProfiles.set(userId, profile);
  return withoutStorageFields(profile);
}

export async function saveProfileSkillsForUser(userId, skills) {
  if (isMongoConfigured() && !canUseMongo()) {
    throw new Error("MongoDB is configured but not connected.");
  }

  if (canUseMongo()) {
    const saved = await Profile.findOneAndUpdate(
      { userId },
      { $set: { skills } },
      { returnDocument: "after", runValidators: true },
    );
    return withoutStorageFields(saved);
  }

  const profile = developmentProfiles.get(userId);
  if (!profile) {
    throw new Error("Profile not found.");
  }

  profile.skills = skills;
  developmentProfiles.set(userId, profile);
  return withoutStorageFields(profile);
}

export async function getPublicProfile(username) {
  if (isMongoConfigured() && !canUseMongo()) {
    throw new Error("MongoDB is configured but not connected.");
  }

  const normalizedUsername = username.trim().toLowerCase();
  const profile = canUseMongo()
    ? await Profile.findOne({ username: normalizedUsername }).lean()
    : Array.from(developmentProfiles.values()).find((item) => item.username === normalizedUsername);

  return withoutStorageFields(profile);
}
