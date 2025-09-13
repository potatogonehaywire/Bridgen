import { Router } from "express";
import { db } from "../db";
import { users, skills, userSkills, skillMatches } from "@shared/schema";
import { eq, and, ne, sql } from "drizzle-orm";
import { authenticateToken, AuthenticatedRequest } from "../auth";

const router = Router();

// Skill matching algorithm
interface MatchCandidate {
  teacherId: string;
  learnerId: string;
  skillId: string;
  skillName: string;
  compatibilityScore: number;
  teacherProficiency: number;
  learnerInterest: number;
  teacherExperience: number;
}

async function calculateSkillMatches(userId: string): Promise<MatchCandidate[]> {
  // Get skills user wants to learn
  const learnerSkills = await db
    .select({
      skillId: userSkills.skillId,
      skillName: skills.name,
      proficiencyLevel: userSkills.proficiencyLevel,
    })
    .from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id))
    .where(and(eq(userSkills.userId, userId), eq(userSkills.wantToLearn, true)));

  // Get skills user wants to teach
  const teacherSkills = await db
    .select({
      skillId: userSkills.skillId,
      skillName: skills.name,
      proficiencyLevel: userSkills.proficiencyLevel,
      yearsExperience: userSkills.yearsExperience,
    })
    .from(userSkills)
    .innerJoin(skills, eq(userSkills.skillId, skills.id))
    .where(and(eq(userSkills.userId, userId), eq(userSkills.wantToTeach, true)));

  const matches: MatchCandidate[] = [];

  // Find matches where user wants to learn
  for (const learnerSkill of learnerSkills) {
    const potentialTeachers = await db
      .select({
        userId: userSkills.userId,
        proficiencyLevel: userSkills.proficiencyLevel,
        yearsExperience: userSkills.yearsExperience,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(userSkills)
      .innerJoin(users, eq(userSkills.userId, users.id))
      .where(
        and(
          eq(userSkills.skillId, learnerSkill.skillId),
          eq(userSkills.wantToTeach, true),
          ne(userSkills.userId, userId), // Not the same user
          sql`${userSkills.proficiencyLevel} > ${learnerSkill.proficiencyLevel}` // Teacher is more proficient
        )
      );

    for (const teacher of potentialTeachers) {
      const compatibilityScore = calculateCompatibilityScore(
        teacher.proficiencyLevel,
        learnerSkill.proficiencyLevel,
        teacher.yearsExperience
      );

      matches.push({
        teacherId: teacher.userId,
        learnerId: userId,
        skillId: learnerSkill.skillId,
        skillName: learnerSkill.skillName,
        compatibilityScore,
        teacherProficiency: teacher.proficiencyLevel,
        learnerInterest: learnerSkill.proficiencyLevel,
        teacherExperience: teacher.yearsExperience,
      });
    }
  }

  // Find matches where user wants to teach
  for (const teacherSkill of teacherSkills) {
    const potentialLearners = await db
      .select({
        userId: userSkills.userId,
        proficiencyLevel: userSkills.proficiencyLevel,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(userSkills)
      .innerJoin(users, eq(userSkills.userId, users.id))
      .where(
        and(
          eq(userSkills.skillId, teacherSkill.skillId),
          eq(userSkills.wantToLearn, true),
          ne(userSkills.userId, userId), // Not the same user
          sql`${userSkills.proficiencyLevel} < ${teacherSkill.proficiencyLevel}` // Learner is less proficient
        )
      );

    for (const learner of potentialLearners) {
      const compatibilityScore = calculateCompatibilityScore(
        teacherSkill.proficiencyLevel,
        learner.proficiencyLevel,
        teacherSkill.yearsExperience
      );

      matches.push({
        teacherId: userId,
        learnerId: learner.userId,
        skillId: teacherSkill.skillId,
        skillName: teacherSkill.skillName,
        compatibilityScore,
        teacherProficiency: teacherSkill.proficiencyLevel,
        learnerInterest: learner.proficiencyLevel,
        teacherExperience: teacherSkill.yearsExperience,
      });
    }
  }

  // Sort by compatibility score and remove duplicates
  return matches
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, 20); // Limit to top 20 matches
}

function calculateCompatibilityScore(
  teacherProficiency: number,
  learnerProficiency: number,
  teacherExperience: number
): number {
  // Base score on proficiency gap (ideal gap is 2-4 levels)
  const proficiencyGap = teacherProficiency - learnerProficiency;
  let proficiencyScore = 0;
  
  if (proficiencyGap >= 2 && proficiencyGap <= 4) {
    proficiencyScore = 100;
  } else if (proficiencyGap === 1 || proficiencyGap === 5) {
    proficiencyScore = 80;
  } else if (proficiencyGap >= 6) {
    proficiencyScore = 60;
  } else {
    proficiencyScore = 40;
  }

  // Experience bonus
  const experienceBonus = Math.min(teacherExperience * 5, 30);

  // Final score
  return (proficiencyScore + experienceBonus) / 130 * 100;
}

// Get skill matches for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const matches = await calculateSkillMatches(userId);
    res.json(matches);
  } catch (error) {
    console.error("Get skill matches error:", error);
    res.status(500).json({ error: "Failed to get skill matches" });
  }
});

// Create a skill match request
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { teacherId, learnerId, skillId } = req.body;

    // Verify the requesting user is either the teacher or learner
    if (req.user!.id !== teacherId && req.user!.id !== learnerId) {
      return res.status(403).json({ error: "Unauthorized to create this match" });
    }

    // Check if match already exists
    const existingMatch = await db.select().from(skillMatches)
      .where(
        and(
          eq(skillMatches.teacherId, teacherId),
          eq(skillMatches.learnerId, learnerId),
          eq(skillMatches.skillId, skillId)
        )
      )
      .limit(1);

    if (existingMatch.length > 0) {
      return res.status(409).json({ error: "Match request already exists" });
    }

    // Calculate compatibility score
    const teacherSkill = await db.select().from(userSkills)
      .where(and(eq(userSkills.userId, teacherId), eq(userSkills.skillId, skillId)))
      .limit(1);

    const learnerSkill = await db.select().from(userSkills)
      .where(and(eq(userSkills.userId, learnerId), eq(userSkills.skillId, skillId)))
      .limit(1);

    if (teacherSkill.length === 0 || learnerSkill.length === 0) {
      return res.status(400).json({ error: "Invalid teacher or learner skill" });
    }

    const compatibilityScore = calculateCompatibilityScore(
      teacherSkill[0].proficiencyLevel,
      learnerSkill[0].proficiencyLevel,
      teacherSkill[0].yearsExperience
    );

    const [newMatch] = await db.insert(skillMatches).values({
      teacherId,
      learnerId,
      skillId,
      compatibilityScore: compatibilityScore.toString(),
      status: "pending",
    }).returning();

    res.status(201).json(newMatch);
  } catch (error) {
    console.error("Create skill match error:", error);
    res.status(500).json({ error: "Failed to create skill match" });
  }
});

// Update match status (accept/reject)
router.put("/:matchId", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { matchId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Get the match to verify permissions
    const [match] = await db.select().from(skillMatches)
      .where(eq(skillMatches.id, matchId))
      .limit(1);

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Verify the user is either teacher or learner
    if (req.user!.id !== match.teacherId && req.user!.id !== match.learnerId) {
      return res.status(403).json({ error: "Unauthorized to update this match" });
    }

    const [updatedMatch] = await db.update(skillMatches)
      .set({ status, updatedAt: new Date() })
      .where(eq(skillMatches.id, matchId))
      .returning();

    res.json(updatedMatch);
  } catch (error) {
    console.error("Update skill match error:", error);
    res.status(500).json({ error: "Failed to update skill match" });
  }
});

// Get skill matching percentiles (for analytics)
router.get("/percentiles", async (req, res) => {
  try {
    // This is a simplified version - in production you'd want more sophisticated analytics
    const percentiles = {
      programming: {
        "25th": 65,
        "50th": 78,
        "75th": 87,
        "90th": 94,
      },
      design: {
        "25th": 62,
        "50th": 75,
        "75th": 85,
        "90th": 92,
      },
      business: {
        "25th": 58,
        "50th": 72,
        "75th": 83,
        "90th": 91,
      },
    };

    res.json(percentiles);
  } catch (error) {
    console.error("Get percentiles error:", error);
    res.status(500).json({ error: "Failed to get percentiles" });
  }
});

export default router;
