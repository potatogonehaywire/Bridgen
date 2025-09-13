import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { db } from "../db";
import { chatMessages, users } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { verifyToken } from "../auth";

interface ChatUser {
  id: string;
  username: string;
  socketId: string;
  currentRoom: string;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  room: string;
  username?: string;
}

export class ChatManager {
  private io: SocketServer;
  private connectedUsers: Map<string, ChatUser> = new Map();
  private roomUsers: Map<string, Set<string>> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      path: "/socket.io/",
    });

    this.initializeEventHandlers();
  }

  private initializeEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log("User connected to chat:", socket.id);

      // Handle authentication
      socket.on("authenticate", async (token: string) => {
        try {
          const decoded = verifyToken(token);
          if (!decoded) {
            socket.emit("auth_error", "Invalid token");
            return;
          }

          // Get user details
          const [user] = await db.select().from(users)
            .where(eq(users.id, decoded.id))
            .limit(1);

          if (!user) {
            socket.emit("auth_error", "User not found");
            return;
          }

          // Store user connection
          this.connectedUsers.set(socket.id, {
            id: user.id,
            username: user.username,
            socketId: socket.id,
            currentRoom: "",
          });

          socket.emit("authenticated", {
            userId: user.id,
            username: user.username,
          });

          console.log(`User ${user.username} authenticated`);
        } catch (error) {
          console.error("Authentication error:", error);
          socket.emit("auth_error", "Authentication failed");
        }
      });

      // Handle joining a chat room
      socket.on("join_room", async (roomId: string) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user) {
            socket.emit("error", "Not authenticated");
            return;
          }

          // Leave current room if any
          if (user.currentRoom) {
            socket.leave(user.currentRoom);
            this.removeUserFromRoom(user.currentRoom, user.id);
          }

          // Join new room
          socket.join(roomId);
          user.currentRoom = roomId;
          this.addUserToRoom(roomId, user.id);

          // Get recent messages for the room
          const recentMessages = await this.getRecentMessages(roomId, 50);
          socket.emit("recent_messages", recentMessages);

          // Get active users in room
          const activeUsers = this.getRoomUsers(roomId);
          this.io.to(roomId).emit("room_users", activeUsers);

          console.log(`User ${user.username} joined room ${roomId}`);
        } catch (error) {
          console.error("Join room error:", error);
          socket.emit("error", "Failed to join room");
        }
      });

      // Handle sending messages
      socket.on("send_message", async (data: { room: string; message: string }) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user) {
            socket.emit("error", "Not authenticated");
            return;
          }

          if (user.currentRoom !== data.room) {
            socket.emit("error", "Not in this room");
            return;
          }

          // Save message to database
          const [savedMessage] = await db.insert(chatMessages).values({
            userId: user.id,
            roomId: data.room,
            message: data.message,
          }).returning();

          // Broadcast message to room
          const messageData: ChatMessage = {
            id: savedMessage.id,
            user: user.id,
            username: user.username,
            message: data.message,
            timestamp: savedMessage.createdAt!,
            room: data.room,
          };

          this.io.to(data.room).emit("new_message", messageData);

          console.log(`Message from ${user.username} in ${data.room}: ${data.message}`);
        } catch (error) {
          console.error("Send message error:", error);
          socket.emit("error", "Failed to send message");
        }
      });

      // Handle typing indicators
      socket.on("typing_start", (room: string) => {
        const user = this.connectedUsers.get(socket.id);
        if (user && user.currentRoom === room) {
          socket.to(room).emit("user_typing", {
            userId: user.id,
            username: user.username,
            isTyping: true,
          });
        }
      });

      socket.on("typing_stop", (room: string) => {
        const user = this.connectedUsers.get(socket.id);
        if (user && user.currentRoom === room) {
          socket.to(room).emit("user_typing", {
            userId: user.id,
            username: user.username,
            isTyping: false,
          });
        }
      });

      // Handle leaving room
      socket.on("leave_room", () => {
        const user = this.connectedUsers.get(socket.id);
        if (user && user.currentRoom) {
          socket.leave(user.currentRoom);
          this.removeUserFromRoom(user.currentRoom, user.id);
          
          // Update room users
          const activeUsers = this.getRoomUsers(user.currentRoom);
          this.io.to(user.currentRoom).emit("room_users", activeUsers);
          
          user.currentRoom = "";
        }
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
          if (user.currentRoom) {
            this.removeUserFromRoom(user.currentRoom, user.id);
            
            // Update room users
            const activeUsers = this.getRoomUsers(user.currentRoom);
            this.io.to(user.currentRoom).emit("room_users", activeUsers);
          }
          
          this.connectedUsers.delete(socket.id);
          console.log(`User ${user.username} disconnected`);
        }
      });
    });
  }

  private addUserToRoom(roomId: string, userId: string) {
    if (!this.roomUsers.has(roomId)) {
      this.roomUsers.set(roomId, new Set());
    }
    this.roomUsers.get(roomId)!.add(userId);
  }

  private removeUserFromRoom(roomId: string, userId: string) {
    const roomUserSet = this.roomUsers.get(roomId);
    if (roomUserSet) {
      roomUserSet.delete(userId);
      if (roomUserSet.size === 0) {
        this.roomUsers.delete(roomId);
      }
    }
  }

  private getRoomUsers(roomId: string): string[] {
    const userIds = Array.from(this.roomUsers.get(roomId) || []);
    return userIds.map(userId => {
      // Find user details from connected users
      for (const [socketId, user] of this.connectedUsers.entries()) {
        if (user.id === userId && user.currentRoom === roomId) {
          return user.username;
        }
      }
      return userId;
    });
  }

  private async getRecentMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const messages = await db
        .select({
          id: chatMessages.id,
          userId: chatMessages.userId,
          username: users.username,
          message: chatMessages.message,
          roomId: chatMessages.roomId,
          createdAt: chatMessages.createdAt,
        })
        .from(chatMessages)
        .innerJoin(users, eq(chatMessages.userId, users.id))
        .where(eq(chatMessages.roomId, roomId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(limit);

      return messages.map(msg => ({
        id: msg.id,
        user: msg.userId,
        username: msg.username,
        message: msg.message,
        timestamp: msg.createdAt!,
        room: msg.roomId,
      })).reverse(); // Reverse to show oldest first
    } catch (error) {
      console.error("Get recent messages error:", error);
      return [];
    }
  }

  // Method to send system messages
  public sendSystemMessage(roomId: string, message: string) {
    this.io.to(roomId).emit("system_message", {
      id: `system_${Date.now()}`,
      message,
      timestamp: new Date(),
      room: roomId,
    });
  }

  // Method to get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Method to get room statistics
  public getRoomStats() {
    const stats = Array.from(this.roomUsers.entries()).map(([roomId, users]) => ({
      roomId,
      userCount: users.size,
    }));
    return stats;
  }
}

export default ChatManager;
