import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

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

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);
app.use("/api/v1/network", networkRoutes);
app.use("/api/v1/messages", messageRoutes);
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profiles", profileRoutes);
app.use("/api/v1/experience", experienceRoutes);
app.use("/api/v1/education", educationRoutes);
app.use("/api/v1/projects", projectRoutes);

export default app;
