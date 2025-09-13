import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, blob, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  age: integer("age"),
  bio: text("bio"),
  profileImageUrl: text("profile_image_url"),
  points: integer("points").default(0),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  streak: integer("streak").default(0),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Skills master table
export const skills = sqliteTable("skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// User skills relationship
export const userSkills = sqliteTable("user_skills", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  skillId: text("skill_id").notNull(),
  proficiencyLevel: integer("proficiency_level").notNull(), // 1-10
  wantToTeach: integer("want_to_teach", { mode: 'boolean' }).default(false),
  wantToLearn: integer("want_to_learn", { mode: 'boolean' }).default(false),
  yearsExperience: integer("years_experience").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Skill matching between users
export const skillMatches = sqliteTable("skill_matches", {
  id: text("id").primaryKey(),
  teacherId: text("teacher_id").notNull(),
  learnerId: text("learner_id").notNull(),
  skillId: text("skill_id").notNull(),
  compatibilityScore: real("compatibility_score"),
  status: text("status").default("pending"), // 'pending', 'accepted', 'rejected', 'completed'
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// User badges and achievements
export const badges = sqliteTable("badges", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  iconUrl: text("icon_url"),
  requirement: text("requirement"), // JSON string describing requirement
  xpReward: integer("xp_reward").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const userBadges = sqliteTable("user_badges", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  badgeId: text("badge_id").notNull(),
  earnedAt: text("earned_at").default(sql`CURRENT_TIMESTAMP`),
});

// Meeting rooms
export const meetingRooms = sqliteTable("meeting_rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  hostId: text("host_id").notNull(),
  maxParticipants: integer("max_participants").default(10),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  meetingUrl: text("meeting_url"),
  scheduledAt: text("scheduled_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const meetingParticipants = sqliteTable("meeting_participants", {
  id: text("id").primaryKey(),
  meetingId: text("meeting_id").notNull(),
  userId: text("user_id").notNull(),
  joinedAt: text("joined_at").default(sql`CURRENT_TIMESTAMP`),
  leftAt: text("left_at"),
});

// Chat messages
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  roomId: text("room_id").notNull(), // 'coffee', 'mentorship', 'general', etc.
  message: text("message").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tracking devices table
export const trackingDevices = sqliteTable("tracking_devices", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  deviceType: text("device_type").notNull(), // 'fitbit', 'garmin', 'apple_watch', 'terra'
  deviceName: text("device_name").notNull(),
  isConnected: integer("is_connected", { mode: 'boolean' }).default(false),
  lastSync: text("last_sync"),
  apiToken: text("api_token"), // Encrypted API token
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Activity data from tracking devices
export const activityData = sqliteTable("activity_data", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  deviceId: text("device_id").notNull(),
  activityType: text("activity_type").notNull(), // 'steps', 'distance', 'calories', 'heart_rate', 'sleep'
  value: integer("value").notNull(),
  unit: text("unit").notNull(), // 'steps', 'km', 'calories', 'bpm', 'hours'
  timestamp: text("timestamp").notNull(),
  xpEarned: integer("xp_earned").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  password: true,
}).partial();

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertUserSkillSchema = createInsertSchema(userSkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSkillMatchSchema = createInsertSchema(skillMatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMeetingRoomSchema = createInsertSchema(meetingRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertTrackingDeviceSchema = createInsertSchema(trackingDevices).omit({
  id: true,
  createdAt: true,
  lastSync: true,
});

export const insertActivityDataSchema = createInsertSchema(activityData).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type UserSkill = typeof userSkills.$inferSelect;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;

export type SkillMatch = typeof skillMatches.$inferSelect;
export type InsertSkillMatch = z.infer<typeof insertSkillMatchSchema>;

export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;

export type MeetingRoom = typeof meetingRooms.$inferSelect;
export type InsertMeetingRoom = z.infer<typeof insertMeetingRoomSchema>;

export type MeetingParticipant = typeof meetingParticipants.$inferSelect;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type TrackingDevice = typeof trackingDevices.$inferSelect;
export type InsertTrackingDevice = z.infer<typeof insertTrackingDeviceSchema>;

export type ActivityData = typeof activityData.$inferSelect;
export type InsertActivityData = z.infer<typeof insertActivityDataSchema>;
