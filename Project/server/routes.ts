import type { Express } from "express";
import { createServer, type Server } from "http";
import apiRoutes from "./routes/index";
import ChatManager from "./websockets/chat";
import cors from "cors";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for all routes
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }));

  // Mount API routes
  app.use("/api", apiRoutes);

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize WebSocket chat manager
  const chatManager = new ChatManager(httpServer);

  // Additional WebSocket endpoint for Zoom sync (compatibility)
  app.post("/api/sync-zoom", (req, res) => {
    res.json({ synced: [] });
  });

  // Add chat statistics endpoint
  app.get("/api/chat/stats", (req, res) => {
    res.json({
      connectedUsers: chatManager.getConnectedUsersCount(),
      roomStats: chatManager.getRoomStats(),
    });
  });

  console.log("🚀 All routes and WebSocket connections initialized");

  return httpServer;
}
