import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import connectDatabase, { isMongoConfigured, isMongoReady } from "./config/database.js";

import authRoutes from "./modules/auth/routes.js";
import profileRoutes from "./modules/profile/routes.js";
import experienceRoutes from "./modules/experience/experience.routes.js";
import educationRoutes from "./modules/education/education.routes.js";
import projectRoutes from "./modules/project/project.routes.js";
import networkRoutes from "./modules/network/network.routes.js";
import messageRoutes from "./modules/message/message.routes.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const allowedOrigins = [
  ...(process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  "https://shareprofile-seven.vercel.app",
].filter((origin, index, origins) => origins.indexOf(origin) === index);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);

/*
 * Health endpoint stays available even when MongoDB is unavailable.
 * This allows Vercel to verify that the API service itself is running.
 */
app.get("/api/v1/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API is running",
  });
});

/*
 * Vercel can execute app.js without running server.js.
 * Connect to MongoDB before handling routes that depend on the database.
 */
app.use("/api/v1", async (req, res, next) => {
  try {
    if (!isMongoConfigured()) {
      return res.status(503).json({
        success: false,
        message: "MongoDB is not configured.",
      });
    }

    if (!isMongoReady()) {
      const connected = await connectDatabase();

      if (!connected || !isMongoReady()) {
        return res.status(503).json({
          success: false,
          message: "MongoDB is configured but not connected.",
        });
      }
    }

    return next();
  } catch (error) {
    console.error("Database initialization failed:", error.message);

    return res.status(503).json({
      success: false,
      message: "Database service is temporarily unavailable.",
    });
  }
});

app.use("/api/v1/network", networkRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profiles", profileRoutes);
app.use("/api/v1/experience", experienceRoutes);
app.use("/api/v1/education", educationRoutes);
app.use("/api/v1/projects", projectRoutes);

export default app;
