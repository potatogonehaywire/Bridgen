import { Router } from "express";
import { db } from "../db";
import { users, skills, userSkills, updateUserSchema } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { authenticateToken, AuthenticatedRequest } from "../auth";
import { z } from "zod";

const router = Router();

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.select().from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user skills with skill details
    const userSkillsData = await db
      .select({
        id: userSkills.id,
        skill: {
          id: skills.id,
          name: skills.name,
          category: skills.category,
          description: skills.description,
        },
        proficiencyLevel: userSkills.proficiencyLevel,
        wantToTeach: userSkills.wantToTeach,
        wantToLearn: userSkills.wantToLearn,
        yearsExperience: userSkills.yearsExperience,
      })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.id))
      .where(eq(userSkills.userId, id));

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      ...userWithoutPassword,
      skills: userSkillsData,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Update user profile
router.put("/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if user can update this profile (only their own or admin)
    if (req.user!.id !== id) {
      return res.status(403).json({ error: "Cannot update another user's profile" });
    }

    const updateData = updateUserSchema.parse(req.body);
    
    const [updatedUser] = await db.update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Add skill to user
router.post("/:id/skills", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if user can update this profile
    if (req.user!.id !== id) {
      return res.status(403).json({ error: "Cannot update another user's skills" });
    }

    const { skillId, proficiencyLevel, wantToTeach, wantToLearn, yearsExperience } = req.body;

    // Check if user already has this skill
    const existingSkill = await db.select().from(userSkills)
      .where(and(eq(userSkills.userId, id), eq(userSkills.skillId, skillId)))
      .limit(1);

    if (existingSkill.length > 0) {
      return res.status(409).json({ error: "User already has this skill" });
    }

    const [newUserSkill] = await db.insert(userSkills).values({
      userId: id,
      skillId,
      proficiencyLevel: proficiencyLevel || 1,
      wantToTeach: wantToTeach || false,
      wantToLearn: wantToLearn || false,
      yearsExperience: yearsExperience || 0,
    }).returning();

    // Get the skill details
    const [skill] = await db.select().from(skills)
      .where(eq(skills.id, skillId))
      .limit(1);

    res.status(201).json({
      ...newUserSkill,
      skill,
    });
  } catch (error) {
    console.error("Add user skill error:", error);
    res.status(500).json({ error: "Failed to add skill" });
  }
});

// Update user skill
router.put("/:id/skills/:skillId", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id, skillId } = req.params;

    // Check if user can update this profile
    if (req.user!.id !== id) {
      return res.status(403).json({ error: "Cannot update another user's skills" });
    }

    const { proficiencyLevel, wantToTeach, wantToLearn, yearsExperience } = req.body;

    const [updatedUserSkill] = await db.update(userSkills)
      .set({
        proficiencyLevel,
        wantToTeach,
        wantToLearn,
        yearsExperience,
        updatedAt: new Date(),
      })
      .where(and(eq(userSkills.userId, id), eq(userSkills.skillId, skillId)))
      .returning();

    if (!updatedUserSkill) {
      return res.status(404).json({ error: "User skill not found" });
    }

    // Get the skill details
    const [skill] = await db.select().from(skills)
      .where(eq(skills.id, skillId))
      .limit(1);

    res.json({
      ...updatedUserSkill,
      skill,
    });
  } catch (error) {
    console.error("Update user skill error:", error);
    res.status(500).json({ error: "Failed to update skill" });
  }
});

// Remove skill from user
router.delete("/:id/skills/:skillId", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id, skillId } = req.params;

    // Check if user can update this profile
    if (req.user!.id !== id) {
      return res.status(403).json({ error: "Cannot update another user's skills" });
    }

    const deletedSkill = await db.delete(userSkills)
      .where(and(eq(userSkills.userId, id), eq(userSkills.skillId, skillId)))
      .returning();

    if (deletedSkill.length === 0) {
      return res.status(404).json({ error: "User skill not found" });
    }

    res.json({ message: "Skill removed successfully" });
  } catch (error) {
    console.error("Remove user skill error:", error);
    res.status(500).json({ error: "Failed to remove skill" });
  }
});

export default router;
