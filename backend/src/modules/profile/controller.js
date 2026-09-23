import { z } from "zod";

import {
  createProfileForUser,
  getProfileForUser,
  getPublicProfile,
  saveProfileImageForUser,
  saveProfileForUser,
} from "./service.js";

const profileSchema = z.object({
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(1).max(50),
  headline: z.string().trim().min(5).max(120),
  about: z.string().max(2000).default(""),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(100),
  phone: z.string().max(30).default(""),
  website: z.string().url().or(z.literal("")).default(""),
});

const profileImageSchema = z.object({
  profileImage: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/, "Invalid image format.")
    .max(2800000, "Image must be smaller than 2 MB."),
});

function sendError(res, error, fallback) {
  const message = error instanceof Error ? error.message : fallback;
  return res.status(400).json({ success: false, message });
}

export async function getMyProfileController(req, res) {
  try {
    let profile = await getProfileForUser(req.user.id);

    if (!profile) {
      profile = await createProfileForUser(req.user.id, req.user.email, req.user);
    }

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return sendError(res, error, "Unable to load profile.");
  }
}

export async function saveMyProfileController(req, res) {
  try {
    const payload = profileSchema.parse(req.body);
    const profile = await saveProfileForUser(req.user.id, req.user.email, payload);
    return res.status(200).json({ success: true, message: "Profile saved.", profile });
  } catch (error) {
    return sendError(res, error, "Unable to save profile.");
  }
}

export async function saveMyProfileImageController(req, res) {
  try {
    const { profileImage } = profileImageSchema.parse(req.body);
    let profile = await getProfileForUser(req.user.id);
    if (!profile) {
      profile = await createProfileForUser(req.user.id, req.user.email, req.user);
    }
    profile = await saveProfileImageForUser(req.user.id, profileImage);
    return res.status(200).json({ success: true, message: "Profile image updated.", profile });
  } catch (error) {
    return sendError(res, error, "Unable to save profile image.");
  }
}

export async function getPublicProfileController(req, res) {
  try {
    const profile = await getPublicProfile(req.params.username);

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return sendError(res, error, "Unable to load public profile.");
  }
}
