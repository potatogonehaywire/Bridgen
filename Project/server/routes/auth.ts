import { Router } from "express";
import { db } from "../db";
import { users, insertUserSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, generateToken, authenticateToken, AuthenticatedRequest } from "../auth";
import { z } from "zod";

const router = Router();

// Registration schema
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Login schema
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await db.select().from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const existingEmail = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    
    const [newUser] = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
    }).returning();

    // Generate token
    const token = generateToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    // Find user
    const [user] = await db.select().from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get current user endpoint
router.get("/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const [user] = await db.select().from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Failed to get user data" });
  }
});

// Logout endpoint (client-side token removal, but we can blacklist if needed)
router.post("/logout", authenticateToken, (req, res) => {
  // In a production app, you might want to blacklist the token
  res.json({ message: "Logged out successfully" });
});

// Demo user creation for testing (creates a random user)
router.post("/demo", async (req, res) => {
  try {
    const randomId = Math.random().toString(36).substring(2, 15);
    const demoUsername = `demo_user_${randomId}`;
    
    const hashedPassword = await hashPassword("demo123");
    
    const [newUser] = await db.insert(users).values({
      username: demoUsername,
      email: `${demoUsername}@demo.com`,
      password: hashedPassword,
      firstName: "Demo",
      lastName: "User",
    }).returning();

    const token = generateToken(newUser.id);
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      user: userWithoutPassword,
      token,
      message: "Demo user created successfully"
    });
  } catch (error) {
    console.error("Demo user creation error:", error);
    res.status(500).json({ error: "Failed to create demo user" });
  }
});

export default router;
