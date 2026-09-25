import { z } from "zod";

import { loginUser, registerUser } from "./service.js";
import { sendWelcomeEmail } from "../../services/mailer.js";
import { createProfileForUser, getProfileForUser } from "../profile/service.js";

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Valid email is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

function getSessionCookieOptions(req) {
  const isHttpsRequest = req.secure || req.headers.origin?.startsWith("https://");

  return {
    httpOnly: true,
    sameSite: isHttpsRequest ? "none" : "lax",
    secure: isHttpsRequest,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };
}

export async function registerController(req, res) {
  try {
    const payload = registerSchema.parse(req.body);
    const result = await registerUser(payload);
    await createProfileForUser(result.user.id, result.user.email, payload);
    try {
      await sendWelcomeEmail(result.user);
    } catch (mailError) {
      console.error("Welcome email failed:", mailError.message);
    }

    res.cookie("token", result.token, getSessionCookieOptions(req));

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: result.user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register user.";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function loginController(req, res) {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await loginUser(payload);

    res.cookie("token", result.token, getSessionCookieOptions(req));

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: result.user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to log in.";

    return res.status(401).json({
      success: false,
      message,
    });
  }
}

export async function meController(req, res) {
  const profile = await getProfileForUser(req.user.id);

  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      provider: req.user.provider,
    },
    profile,
  });
}

export function logoutController(req, res) {
  res.clearCookie("token", getSessionCookieOptions(req));

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}
