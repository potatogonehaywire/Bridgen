import { Router } from "express";
import { db } from "../db";
import { skills, insertSkillSchema } from "@shared/schema";
import { eq, ilike } from "drizzle-orm";
import { authenticateToken } from "../auth";
import { z } from "zod";

const router = Router();

// Get all skills with optional search
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = db.select().from(skills);

    if (search) {
      query = query.where(ilike(skills.name, `%${search}%`));
    }

    if (category) {
      query = query.where(eq(skills.category, category as string));
    }

    const skillsData = await query;
    res.json(skillsData);
  } catch (error) {
    console.error("Get skills error:", error);
    res.status(500).json({ error: "Failed to get skills" });
  }
});

// Get skill by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [skill] = await db.select().from(skills)
      .where(eq(skills.id, id))
      .limit(1);

    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json(skill);
  } catch (error) {
    console.error("Get skill error:", error);
    res.status(500).json({ error: "Failed to get skill" });
  }
});

// Create new skill (protected - could be admin only in production)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const skillData = insertSkillSchema.parse(req.body);

    // Check if skill already exists
    const existingSkill = await db.select().from(skills)
      .where(eq(skills.name, skillData.name))
      .limit(1);

    if (existingSkill.length > 0) {
      return res.status(409).json({ error: "Skill already exists" });
    }

    const [newSkill] = await db.insert(skills).values(skillData).returning();
    res.status(201).json(newSkill);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Create skill error:", error);
    res.status(500).json({ error: "Failed to create skill" });
  }
});

// Update skill (protected - could be admin only in production)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = insertSkillSchema.partial().parse(req.body);

    const [updatedSkill] = await db.update(skills)
      .set(updateData)
      .where(eq(skills.id, id))
      .returning();

    if (!updatedSkill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json(updatedSkill);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Update skill error:", error);
    res.status(500).json({ error: "Failed to update skill" });
  }
});

// Delete skill (protected - could be admin only in production)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSkill = await db.delete(skills)
      .where(eq(skills.id, id))
      .returning();

    if (deletedSkill.length === 0) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Delete skill error:", error);
    res.status(500).json({ error: "Failed to delete skill" });
  }
});

// Get skill categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await db.selectDistinct({ category: skills.category }).from(skills);
    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error("Get skill categories error:", error);
    res.status(500).json({ error: "Failed to get categories" });
  }
});

export default router;
