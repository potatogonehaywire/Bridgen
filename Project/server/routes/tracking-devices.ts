import { Router } from "express";
import { db } from "../db";
import { trackingDevices, activityData, users, insertTrackingDeviceSchema, insertActivityDataSchema } from "@shared/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { authenticateToken, AuthenticatedRequest } from "../auth";
import { z } from "zod";

const router = Router();

// Get user's tracking devices
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const devices = await db.select().from(trackingDevices)
      .where(eq(trackingDevices.userId, userId))
      .orderBy(desc(trackingDevices.createdAt));

    res.json(devices);
  } catch (error) {
    console.error("Get tracking devices error:", error);
    res.status(500).json({ error: "Failed to get tracking devices" });
  }
});

// Add new tracking device
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const deviceData = insertTrackingDeviceSchema.parse({
      ...req.body,
      userId: req.user!.id,
    });

    // Check if device already exists for this user
    const existingDevice = await db.select().from(trackingDevices)
      .where(
        and(
          eq(trackingDevices.userId, req.user!.id),
          eq(trackingDevices.deviceType, deviceData.deviceType),
          eq(trackingDevices.deviceName, deviceData.deviceName)
        )
      )
      .limit(1);

    if (existingDevice.length > 0) {
      return res.status(409).json({ error: "Device already registered" });
    }

    const [newDevice] = await db.insert(trackingDevices).values(deviceData).returning();

    res.status(201).json(newDevice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Add tracking device error:", error);
    res.status(500).json({ error: "Failed to add tracking device" });
  }
});

// Update tracking device
router.put("/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = insertTrackingDeviceSchema.partial().parse(req.body);

    // Check if device belongs to user
    const [device] = await db.select().from(trackingDevices)
      .where(eq(trackingDevices.id, id))
      .limit(1);

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    if (device.userId !== req.user!.id) {
      return res.status(403).json({ error: "Cannot update another user's device" });
    }

    const [updatedDevice] = await db.update(trackingDevices)
      .set({ ...updateData, lastSync: new Date() })
      .where(eq(trackingDevices.id, id))
      .returning();

    res.json(updatedDevice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Update tracking device error:", error);
    res.status(500).json({ error: "Failed to update tracking device" });
  }
});

// Delete tracking device
router.delete("/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if device belongs to user
    const [device] = await db.select().from(trackingDevices)
      .where(eq(trackingDevices.id, id))
      .limit(1);

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    if (device.userId !== req.user!.id) {
      return res.status(403).json({ error: "Cannot delete another user's device" });
    }

    await db.delete(trackingDevices)
      .where(eq(trackingDevices.id, id));

    res.json({ message: "Device deleted successfully" });
  } catch (error) {
    console.error("Delete tracking device error:", error);
    res.status(500).json({ error: "Failed to delete tracking device" });
  }
});

// Sync activity data from device
router.post("/:deviceId/sync", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { deviceId } = req.params;
    const { activities } = req.body;

    // Verify device belongs to user
    const [device] = await db.select().from(trackingDevices)
      .where(eq(trackingDevices.id, deviceId))
      .limit(1);

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    if (device.userId !== req.user!.id) {
      return res.status(403).json({ error: "Cannot sync data for another user's device" });
    }

    const syncedActivities = [];
    let totalXPEarned = 0;

    // Process each activity
    for (const activity of activities) {
      const xpEarned = calculateXPForActivity(activity.activityType, activity.value);
      
      const activityRecord = insertActivityDataSchema.parse({
        userId: device.userId,
        deviceId: deviceId,
        activityType: activity.activityType,
        value: activity.value,
        unit: activity.unit,
        timestamp: new Date(activity.timestamp),
        xpEarned,
      });

      const [newActivity] = await db.insert(activityData).values(activityRecord).returning();
      syncedActivities.push(newActivity);
      totalXPEarned += xpEarned;
    }

    // Update device last sync time
    await db.update(trackingDevices)
      .set({ lastSync: new Date() })
      .where(eq(trackingDevices.id, deviceId));

    // Update user XP and points
    if (totalXPEarned > 0) {
      await db.update(users)
        .set({
          xp: sql`${users.xp} + ${totalXPEarned}`,
          points: sql`${users.points} + ${totalXPEarned}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, device.userId));
    }

    res.json({
      message: "Activity data synced successfully",
      syncedCount: syncedActivities.length,
      totalXPEarned,
      activities: syncedActivities,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Sync activity data error:", error);
    res.status(500).json({ error: "Failed to sync activity data" });
  }
});

// Get user's activity data
router.get("/user/:userId/activities", async (req, res) => {
  try {
    const { userId } = req.params;
    const { from, to, type } = req.query;

    let query = db.select({
      id: activityData.id,
      deviceId: activityData.deviceId,
      deviceName: trackingDevices.deviceName,
      deviceType: trackingDevices.deviceType,
      activityType: activityData.activityType,
      value: activityData.value,
      unit: activityData.unit,
      timestamp: activityData.timestamp,
      xpEarned: activityData.xpEarned,
    })
    .from(activityData)
    .innerJoin(trackingDevices, eq(activityData.deviceId, trackingDevices.id))
    .where(eq(activityData.userId, userId));

    // Add date filtering
    if (from) {
      query = query.where(gte(activityData.timestamp, new Date(from as string)));
    }

    // Add activity type filtering
    if (type) {
      query = query.where(eq(activityData.activityType, type as string));
    }

    const activities = await query.orderBy(desc(activityData.timestamp));

    res.json(activities);
  } catch (error) {
    console.error("Get activity data error:", error);
    res.status(500).json({ error: "Failed to get activity data" });
  }
});

// Get activity summary for user
router.get("/user/:userId/summary", async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '7d' } = req.query;

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get activity summaries
    const summary = await db
      .select({
        activityType: activityData.activityType,
        totalValue: sql<number>`sum(${activityData.value})`,
        totalXP: sql<number>`sum(${activityData.xpEarned})`,
        activityCount: sql<number>`count(*)`,
      })
      .from(activityData)
      .where(
        and(
          eq(activityData.userId, userId),
          gte(activityData.timestamp, startDate)
        )
      )
      .groupBy(activityData.activityType);

    res.json({
      period,
      startDate,
      endDate: now,
      summary,
    });
  } catch (error) {
    console.error("Get activity summary error:", error);
    res.status(500).json({ error: "Failed to get activity summary" });
  }
});

// Calculate XP based on activity type and value
function calculateXPForActivity(activityType: string, value: number): number {
  const xpRates = {
    steps: 0.01, // 1 XP per 100 steps
    distance: 10, // 10 XP per km
    calories: 0.1, // 1 XP per 10 calories
    heart_rate: 0, // No XP for heart rate readings
    sleep: 20, // 20 XP per hour of sleep
    exercise: 50, // 50 XP per exercise session
    meditation: 30, // 30 XP per meditation session
  };

  const rate = xpRates[activityType as keyof typeof xpRates] || 1;
  return Math.round(value * rate);
}

export default router;
