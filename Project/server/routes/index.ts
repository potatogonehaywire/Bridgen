import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import skillRoutes from "./skills";
import skillMatchRoutes from "./skill-matches";
import gamificationRoutes from "./gamification";
import meetingRoomRoutes from "./meeting-rooms";
import trackingDeviceRoutes from "./tracking-devices";

const router = Router();

// Mount all route modules
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/skills", skillRoutes);
router.use("/skill-matches", skillMatchRoutes);
router.use("/gam", gamificationRoutes); // Using "gam" to match frontend expectations
router.use("/meeting-rooms", meetingRoomRoutes);
router.use("/tracking-devices", trackingDeviceRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    name: "Bridges Between Generations API",
    version: "1.0.0",
    description: "Backend API for connecting different generations through skill sharing and mentorship",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      skills: "/api/skills",
      skillMatches: "/api/skill-matches",
      gamification: "/api/gam",
      meetingRooms: "/api/meeting-rooms",
      trackingDevices: "/api/tracking-devices",
    },
  });
});

export default router;
