import { Router } from "express";
import { db } from "../db";
import { users, badges, userBadges, activityData } from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";
import { authenticateToken, AuthenticatedRequest } from "../auth";

const router = Router();

// XP calculation constants
const XP_PER_LEVEL = 100;
const MAX_LEVEL = 100;

// Calculate level from XP
function calculateLevel(xp: number): number {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, MAX_LEVEL);
}

// Calculate XP needed for next level
function xpNeededForNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return 0;
  return (level * XP_PER_LEVEL) - ((level - 1) * XP_PER_LEVEL);
}

// Get user's gamification state
router.get("/state/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user data
    const [user] = await db.select().from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user badges
    const userBadgesList = await db
      .select({
        badge: {
          id: badges.id,
          name: badges.name,
          description: badges.description,
          iconUrl: badges.iconUrl,
          xpReward: badges.xpReward,
        },
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));

    // Calculate current level
    const currentLevel = calculateLevel(user.xp || 0);
    const xpInCurrentLevel = (user.xp || 0) % XP_PER_LEVEL;
    const xpNeededForNext = XP_PER_LEVEL - xpInCurrentLevel;

    const gamificationState = {
      id: user.id,
      username: user.username,
      level: currentLevel,
      xp: user.xp || 0,
      xpInCurrentLevel,
      xpNeededForNext,
      streak: user.streak || 0,
      badges: userBadgesList.map(ub => ub.badge.name),
      skills: [], // This would come from user skills
      totalPoints: user.points || 0,
    };

    res.json(gamificationState);
  } catch (error) {
    console.error("Get gamification state error:", error);
    res.status(500).json({ error: "Failed to get gamification state" });
  }
});

// Award points/XP
router.post("/earn", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId, points, reason } = req.body;

    // Verify user can award points to this account (themselves or admin)
    if (req.user!.id !== userId) {
      return res.status(403).json({ error: "Cannot award points to another user" });
    }

    // Get current user data
    const [user] = await db.select().from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newXP = (user.xp || 0) + points;
    const newPoints = (user.points || 0) + points;
    const newLevel = calculateLevel(newXP);
    const oldLevel = calculateLevel(user.xp || 0);

    // Update user XP and points
    const [updatedUser] = await db.update(users)
      .set({
        xp: newXP,
        points: newPoints,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    // Check for level up badges
    const levelUpBadges = [];
    if (newLevel > oldLevel) {
      // Award level-up badge
      const levelBadgeName = `Level ${newLevel} Unlocked`;
      
      // Check if badge exists, create if not
      let [levelBadge] = await db.select().from(badges)
        .where(eq(badges.name, levelBadgeName))
        .limit(1);

      if (!levelBadge) {
        [levelBadge] = await db.insert(badges).values({
          name: levelBadgeName,
          description: `Reached level ${newLevel}`,
          xpReward: newLevel * 10,
        }).returning();
      }

      // Award badge to user if they don't have it
      const existingBadge = await db.select().from(userBadges)
        .where(eq(userBadges.userId, userId) && eq(userBadges.badgeId, levelBadge.id))
        .limit(1);

      if (existingBadge.length === 0) {
        await db.insert(userBadges).values({
          userId,
          badgeId: levelBadge.id,
        });
        levelUpBadges.push(levelBadge.name);
      }
    }

    // Log activity for tracking
    await db.insert(activityData).values({
      userId,
      deviceId: "gamification-system",
      activityType: "xp_earned",
      value: points,
      unit: "xp",
      timestamp: new Date(),
      xpEarned: points,
    });

    res.json({
      success: true,
      message: `Earned ${points} XP!`,
      newTotal: newXP,
      levelUp: newLevel > oldLevel,
      newLevel,
      badgesEarned: levelUpBadges,
    });
  } catch (error) {
    console.error("Earn points error:", error);
    res.status(500).json({ error: "Failed to award points" });
  }
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await db
      .select({
        userId: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        level: users.level,
        xp: users.xp,
        points: users.points,
      })
      .from(users)
      .orderBy(desc(users.xp), desc(users.points))
      .limit(Number(limit));

    // Calculate scores and add rankings
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      username: user.username,
      displayName: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.username,
      level: user.level || 1,
      score: (user.xp || 0) + (user.level || 1) * 100, // Combine XP and level for scoring
      xp: user.xp || 0,
      points: user.points || 0,
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

// Get available badges
router.get("/badges", async (req, res) => {
  try {
    const allBadges = await db.select().from(badges);
    res.json(allBadges);
  } catch (error) {
    console.error("Get badges error:", error);
    res.status(500).json({ error: "Failed to get badges" });
  }
});

// Get user's badges
router.get("/badges/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userBadgesList = await db
      .select({
        badge: {
          id: badges.id,
          name: badges.name,
          description: badges.description,
          iconUrl: badges.iconUrl,
          xpReward: badges.xpReward,
        },
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));

    res.json(userBadgesList);
  } catch (error) {
    console.error("Get user badges error:", error);
    res.status(500).json({ error: "Failed to get user badges" });
  }
});

// Update user streak (called daily)
router.post("/streak/:userId", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;

    // Verify user can update this streak
    if (req.user!.id !== userId) {
      return res.status(403).json({ error: "Cannot update another user's streak" });
    }

    const [user] = await db.select().from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has logged in today
    const lastLogin = user.lastLoginAt;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = user.streak || 0;

    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin);
      const isSameDay = lastLoginDate.toDateString() === today.toDateString();
      const isYesterday = lastLoginDate.toDateString() === yesterday.toDateString();

      if (isSameDay) {
        // Already logged in today, no change
      } else if (isYesterday) {
        // Consecutive day, increment streak
        newStreak += 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
    } else {
      // First login ever
      newStreak = 1;
    }

    // Calculate streak bonus XP
    const streakBonus = Math.min(newStreak * 5, 100); // Max 100 XP bonus

    // Update user
    const [updatedUser] = await db.update(users)
      .set({
        streak: newStreak,
        xp: (user.xp || 0) + streakBonus,
        points: (user.points || 0) + streakBonus,
        lastLoginAt: today,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    res.json({
      streak: newStreak,
      bonusXP: streakBonus,
      message: `${newStreak} day streak! Earned ${streakBonus} bonus XP!`,
    });
  } catch (error) {
    console.error("Update streak error:", error);
    res.status(500).json({ error: "Failed to update streak" });
  }
});

export default router;
