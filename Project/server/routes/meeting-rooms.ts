import { Router } from "express";
import { db } from "../db";
import { meetingRooms, meetingParticipants, users, insertMeetingRoomSchema } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticateToken, AuthenticatedRequest } from "../auth";
import { z } from "zod";

const router = Router();

// Get all active meeting rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await db
      .select({
        id: meetingRooms.id,
        name: meetingRooms.name,
        description: meetingRooms.description,
        hostId: meetingRooms.hostId,
        hostUsername: users.username,
        maxParticipants: meetingRooms.maxParticipants,
        isActive: meetingRooms.isActive,
        scheduledAt: meetingRooms.scheduledAt,
        createdAt: meetingRooms.createdAt,
      })
      .from(meetingRooms)
      .innerJoin(users, eq(meetingRooms.hostId, users.id))
      .where(eq(meetingRooms.isActive, true))
      .orderBy(desc(meetingRooms.createdAt));

    // Get participant counts for each room
    const roomsWithParticipants = await Promise.all(
      rooms.map(async (room) => {
        const participantCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(meetingParticipants)
          .where(
            and(
              eq(meetingParticipants.meetingId, room.id),
              sql`${meetingParticipants.leftAt} IS NULL`
            )
          );

        return {
          ...room,
          currentParticipants: participantCount[0]?.count || 0,
        };
      })
    );

    res.json(roomsWithParticipants);
  } catch (error) {
    console.error("Get meeting rooms error:", error);
    res.status(500).json({ error: "Failed to get meeting rooms" });
  }
});

// Get specific meeting room
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [room] = await db
      .select({
        id: meetingRooms.id,
        name: meetingRooms.name,
        description: meetingRooms.description,
        hostId: meetingRooms.hostId,
        hostUsername: users.username,
        maxParticipants: meetingRooms.maxParticipants,
        isActive: meetingRooms.isActive,
        meetingUrl: meetingRooms.meetingUrl,
        scheduledAt: meetingRooms.scheduledAt,
        createdAt: meetingRooms.createdAt,
      })
      .from(meetingRooms)
      .innerJoin(users, eq(meetingRooms.hostId, users.id))
      .where(eq(meetingRooms.id, id))
      .limit(1);

    if (!room) {
      return res.status(404).json({ error: "Meeting room not found" });
    }

    // Get current participants
    const participants = await db
      .select({
        userId: meetingParticipants.userId,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        joinedAt: meetingParticipants.joinedAt,
      })
      .from(meetingParticipants)
      .innerJoin(users, eq(meetingParticipants.userId, users.id))
      .where(
        and(
          eq(meetingParticipants.meetingId, id),
          sql`${meetingParticipants.leftAt} IS NULL`
        )
      );

    res.json({
      ...room,
      participants,
      currentParticipants: participants.length,
    });
  } catch (error) {
    console.error("Get meeting room error:", error);
    res.status(500).json({ error: "Failed to get meeting room" });
  }
});

// Create new meeting room
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const roomData = insertMeetingRoomSchema.parse({
      ...req.body,
      hostId: req.user!.id,
    });

    // Generate meeting URL (in production, integrate with actual video service)
    const meetingUrl = `https://meet.example.com/room/${Date.now()}`;

    const [newRoom] = await db.insert(meetingRooms).values({
      ...roomData,
      meetingUrl,
    }).returning();

    res.status(201).json(newRoom);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Create meeting room error:", error);
    res.status(500).json({ error: "Failed to create meeting room" });
  }
});

// Join meeting room
router.post("/:roomId/join", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.id;

    // Check if room exists and is active
    const [room] = await db.select().from(meetingRooms)
      .where(and(eq(meetingRooms.id, roomId), eq(meetingRooms.isActive, true)))
      .limit(1);

    if (!room) {
      return res.status(404).json({ error: "Meeting room not found or inactive" });
    }

    // Check if user is already in the room
    const existingParticipant = await db.select().from(meetingParticipants)
      .where(
        and(
          eq(meetingParticipants.meetingId, roomId),
          eq(meetingParticipants.userId, userId),
          sql`${meetingParticipants.leftAt} IS NULL`
        )
      )
      .limit(1);

    if (existingParticipant.length > 0) {
      return res.status(409).json({ error: "Already in this meeting room" });
    }

    // Check room capacity
    const currentParticipants = await db.select().from(meetingParticipants)
      .where(
        and(
          eq(meetingParticipants.meetingId, roomId),
          sql`${meetingParticipants.leftAt} IS NULL`
        )
      );

    if (currentParticipants.length >= room.maxParticipants) {
      return res.status(409).json({ error: "Meeting room is full" });
    }

    // Add user to meeting
    const [participant] = await db.insert(meetingParticipants).values({
      meetingId: roomId,
      userId,
    }).returning();

    res.json({
      success: true,
      message: `Joined room ${room.name}`,
      roomId: roomId,
      meetingUrl: room.meetingUrl,
      participant,
    });
  } catch (error) {
    console.error("Join meeting room error:", error);
    res.status(500).json({ error: "Failed to join meeting room" });
  }
});

// Leave meeting room
router.post("/:roomId/leave", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.id;

    // Update participant record to mark as left
    const updatedParticipant = await db.update(meetingParticipants)
      .set({ leftAt: new Date() })
      .where(
        and(
          eq(meetingParticipants.meetingId, roomId),
          eq(meetingParticipants.userId, userId),
          sql`${meetingParticipants.leftAt} IS NULL`
        )
      )
      .returning();

    if (updatedParticipant.length === 0) {
      return res.status(404).json({ error: "Not currently in this meeting room" });
    }

    res.json({
      success: true,
      message: "Left meeting room successfully",
    });
  } catch (error) {
    console.error("Leave meeting room error:", error);
    res.status(500).json({ error: "Failed to leave meeting room" });
  }
});

// Update meeting room (host only)
router.put("/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = insertMeetingRoomSchema.partial().parse(req.body);

    // Check if user is the host
    const [room] = await db.select().from(meetingRooms)
      .where(eq(meetingRooms.id, id))
      .limit(1);

    if (!room) {
      return res.status(404).json({ error: "Meeting room not found" });
    }

    if (room.hostId !== req.user!.id) {
      return res.status(403).json({ error: "Only the host can update this room" });
    }

    const [updatedRoom] = await db.update(meetingRooms)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(meetingRooms.id, id))
      .returning();

    res.json(updatedRoom);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Update meeting room error:", error);
    res.status(500).json({ error: "Failed to update meeting room" });
  }
});

// Delete/deactivate meeting room (host only)
router.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if user is the host
    const [room] = await db.select().from(meetingRooms)
      .where(eq(meetingRooms.id, id))
      .limit(1);

    if (!room) {
      return res.status(404).json({ error: "Meeting room not found" });
    }

    if (room.hostId !== req.user!.id) {
      return res.status(403).json({ error: "Only the host can delete this room" });
    }

    // Deactivate room instead of deleting
    const [updatedRoom] = await db.update(meetingRooms)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(meetingRooms.id, id))
      .returning();

    // Mark all current participants as left
    await db.update(meetingParticipants)
      .set({ leftAt: new Date() })
      .where(
        and(
          eq(meetingParticipants.meetingId, id),
          sql`${meetingParticipants.leftAt} IS NULL`
        )
      );

    res.json({
      success: true,
      message: "Meeting room deactivated successfully",
    });
  } catch (error) {
    console.error("Delete meeting room error:", error);
    res.status(500).json({ error: "Failed to delete meeting room" });
  }
});

export default router;
