const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/matchmaker";

// -----------------------------
// MongoDB Models
// -----------------------------
const profileSchema = new mongoose.Schema({
  id: String,
  username: String,
  skills: [String],
  availability: [String],
});

const sessionSchema = new mongoose.Schema({
  sessionId: String,
  a: Object,
  b: Object,
  ts: Number,
});

const Profile = mongoose.model("Profile", profileSchema);
const Session = mongoose.model("Session", sessionSchema);

// -----------------------------
// In-memory state
// -----------------------------
const queue = new Map();
const socketsByUser = new Map();

// -----------------------------
// Matching Logic
// -----------------------------
function scoreCompatibility(a, b) {
  const skillsA = new Set(a.skills || []);
  const skillsB = new Set(b.skills || []);
  const sharedSkills = [...skillsA].filter((s) => skillsB.has(s));

  const availA = new Set(a.availability || []);
  const availB = new Set(b.availability || []);
  const sharedAvailability = [...availA].filter((t) => availB.has(t));

  const score = sharedSkills.length * 2 + sharedAvailability.length;
  return { score, sharedSkills, sharedAvailability };
}

async function computeAndEmitMatchesForUser(userId) {
  const profile = queue.get(userId);
  if (!profile) return;

  const scores = [];
  for (const [otherId, otherProfile] of queue.entries()) {
    if (otherId === userId) continue;
    const { score, sharedSkills, sharedAvailability } = scoreCompatibility(profile, otherProfile);
    scores.push({
      userId: otherId,
      username: otherProfile.username,
      score,
      sharedSkills,
      sharedAvailability,
    });
  }

  scores.sort((a, b) => b.score - a.score);
  const sid = socketsByUser.get(userId);
  if (sid) io.to(sid).emit("matchUpdate", scores);
}

async function attemptAutoMatchForUser(userId) {
  const profile = queue.get(userId);
  if (!profile) return;

  let best = null;
  for (const [otherId, otherProfile] of queue.entries()) {
    if (otherId === userId) continue;
    const { score } = scoreCompatibility(profile, otherProfile);
    if (!best || score > best.score) best = { otherId, otherProfile, score };
  }

  if (best && best.score >= 1) {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const a = profile;
    const b = best.otherProfile;

    queue.delete(userId);
    queue.delete(best.otherId);

    const sidA = socketsByUser.get(userId);
    const sidB = socketsByUser.get(best.otherId);
    const payload = { sessionId, a, b };

    if (sidA) io.to(sidA).emit("matched", payload);
    if (sidB) io.to(sidB).emit("matched", payload);

    await Session.create({ sessionId, a, b, ts: Date.now() });
  }
}

// -----------------------------
// Socket Events
// -----------------------------
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinQueue", async (profile) => {
    if (!profile || !profile.id) return;
    queue.set(profile.id, profile);
    socketsByUser.set(profile.id, socket.id);

    await Profile.findOneAndUpdate({ id: profile.id }, profile, { upsert: true });
    computeAndEmitMatchesForUser(profile.id);
    attemptAutoMatchForUser(profile.id);
    socket.emit("notification", "Joined matching queue");
  });

  socket.on("leaveQueue", (userId) => {
    queue.delete(userId);
    socketsByUser.delete(userId);
    socket.emit("notification", "Left matching queue");
  });

  socket.on("updateProfile", async (profile) => {
    if (!profile || !profile.id) return;
    queue.set(profile.id, profile);
    socketsByUser.set(profile.id, socket.id);

    await Profile.findOneAndUpdate({ id: profile.id }, profile, { upsert: true });
    computeAndEmitMatchesForUser(profile.id);
  });

  socket.on("requestManualMatch", (userId) => {
    if (!queue.has(userId)) {
      socket.emit("notification", "You are not in the queue. Join first.");
      return;
    }
    computeAndEmitMatchesForUser(userId);
    attemptAutoMatchForUser(userId);
    socket.emit("notification", "Manual match attempted");
  });

  socket.on("acceptMatch", async ({ inviterId, acceptorId }) => {
    const a = queue.get(inviterId);
    const b = queue.get(acceptorId);
    if (!a || !b) {
      socket.emit("notification", "One of the users is no longer available.");
      return;
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const payload = { sessionId, a, b };

    queue.delete(inviterId);
    queue.delete(acceptorId);

    const sidA = socketsByUser.get(inviterId);
    const sidB = socketsByUser.get(acceptorId);

    if (sidA) io.to(sidA).emit("matched", payload);
    if (sidB) io.to(sidB).emit("matched", payload);

    await Session.create({ sessionId, a, b, ts: Date.now() });
  });

  socket.on("disconnect", () => {
    for (const [userId, sid] of socketsByUser.entries()) {
      if (sid === socket.id) socketsByUser.delete(userId);
    }
    console.log("Socket disconnected:", socket.id);
  });
});

// -----------------------------
// REST API
// -----------------------------
app.get("/", async (req, res) => {
  const sessionCount = await Session.countDocuments();
  res.send({ ok: true, queueSize: queue.size, sessions: sessionCount });
});

app.get("/sessions", async (req, res) => {
  const sessions = await Session.find().sort({ ts: -1 }).limit(50);
  res.json(sessions);
});

app.get("/profile/:id", async (req, res) => {
  const profile = await Profile.findOne({ id: req.params.id });
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  res.json(profile);
});

// -----------------------------
// Start Server
// -----------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Match server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
