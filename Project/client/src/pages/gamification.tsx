import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export type UserProfile = {
  id: string;
  username: string;
  level: number;
  xp: number;
  streak: number;
  badges: string[];
  skills: string[];
};

export type LeaderboardEntry = {
  userId: string;
  username: string;
  score: number;
  level: number;
};

const SOCKET_URL = import.meta.env.VITE_GAMIFY_SOCKET ?? "http://localhost:5000";
const USE_MOCK = true; // Use mock data for now to avoid socket issues

function xpNeededForLevel(level: number) {
  return Math.floor(500 * Math.pow(1.25, level - 1));
}

function applyDailyBonus(user: UserProfile): UserProfile {
  const bonus = 50 * Math.min(user.streak, 30);
  return {
    ...user,
    xp: user.xp + bonus,
    streak: user.streak + 1,
  };
}

export function useGamification(userId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    if (USE_MOCK) {
      setProfile({
        id: userId,
        username: "DemoUser",
        level: 3,
        xp: 1250,
        streak: 5,
        badges: ["First Steps", "Learning Path"],
        skills: ["Math", "Science", "Technology"],
      });
      setLeaderboard([
        { userId: "demo1", username: "Alice", score: 2500, level: 4 },
        { userId: "demo2", username: "Bob", score: 1800, level: 3 },
        { userId: userId, username: "DemoUser", score: 1550, level: 3 },
      ]);
      return;
    }

    const s = io(SOCKET_URL, { transports: ["websocket"] });
    setSocket(s);

    s.on("profileUpdate", (data: UserProfile) => {
      setProfile(data);
      updateLeaderboard(data);
    });

    s.on("leaderboardUpdate", (lb: LeaderboardEntry[]) => {
      setLeaderboard(lb.sort((a, b) => b.score - a.score));
    });

    s.on("notification", (msg: string) => pushNotif(msg));

    s.emit("getProfile", userId);

    return () => {
      s.disconnect();
    };
  }, [userId]);

  function pushNotif(msg: string) {
    const timestamp = new Date().toLocaleTimeString();
    setNotifications((prev) => [`${timestamp} — ${msg}`, ...prev].slice(0, 5));
  }

  function updateLeaderboard(p: UserProfile) {
    const entry: LeaderboardEntry = {
      userId: p.id,
      username: p.username,
      score: p.xp + p.level * 100,
      level: p.level,
    };
    setLeaderboard((prev) =>
      [...prev.filter((e) => e.userId !== p.id), entry].sort((a, b) => b.score - a.score)
    );
  }

  function earnPoints(amount: number) {
    if (!profile) return;
    if (cooldown) return;

    setCooldown(true);
    setTimeout(() => setCooldown(false), 3000);

    if (USE_MOCK) {
      const newXp = profile.xp + amount;
      const currentLevelXp = xpNeededForLevel(profile.level);
      const newLevel = newXp >= currentLevelXp ? profile.level + 1 : profile.level;
      
      const updated: UserProfile = {
        ...profile,
        xp: newXp,
        level: newLevel,
      };
      
      setProfile(updated);
      updateLeaderboard(updated);
      pushNotif(`🎯 Earned ${amount} XP!`);
      
      if (newLevel > profile.level) {
        pushNotif(`🎉 Level up! You're now level ${newLevel}!`);
      }
      return;
    }

    if (socket) {
      socket.emit("earnPoints", { userId, amount });
    }
  }

  function claimDailyBonus() {
    if (!profile) return;
    if (USE_MOCK) {
      const updated = applyDailyBonus(profile);
      pushNotif(`🔥 Daily streak bonus applied! (+${50 * Math.min(profile.streak, 30)} XP)`);
      setProfile(updated);
      updateLeaderboard(updated);
      return;
    }
    if (socket) socket.emit("claimDaily", { userId });
  }

  return { profile, leaderboard, notifications, earnPoints, claimDailyBonus, cooldown };
}

function Gamification({ userId }: { userId: string }) {
  const { profile, leaderboard, notifications, earnPoints, claimDailyBonus, cooldown } =
    useGamification(userId);

  if (!profile) return <div className="text-center py-20">Loading profile...</div>;

  const xpNeeded = xpNeededForLevel(profile.level);
  const progress = Math.min((profile.xp / xpNeeded) * 100, 100);

  return (
    <section id="gamify" className="py-20 bg-background font-arcade">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl text-primary text-center mb-6 neon-glow">🏆 Gamification</h2>

        {/* XP + LEVEL */}
        <div className="bg-card p-6 rounded-lg shadow-md mb-6 text-center pulse-border">
          <h3 className="text-xl mb-2 rainbow-text">Level {profile.level}</h3>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
            className="h-4 color-shift-bg rounded-full"
            title={`${profile.xp} / ${xpNeeded} XP`}
          />
          <p className="text-sm mt-2">
            {profile.xp} / {xpNeeded} XP ({progress.toFixed(1)}%)
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center mb-6">
          <Button
            onClick={() => earnPoints(120)}
            className="bg-primary px-6"
            disabled={cooldown}
            data-testid="button-earn-points"
          >
            {cooldown ? "Cooldown..." : "Earn Points"}
          </Button>
          <Button onClick={claimDailyBonus} className="bg-accent px-6" data-testid="button-daily-bonus">
            Claim Daily Bonus
          </Button>
        </div>

        {/* Streaks & Badges */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card p-4 rounded">
            <h4 className="text-lg mb-2">🔥 Streak</h4>
            <p data-testid="text-streak-days">{profile.streak} days</p>
            <p className="text-xs text-muted-foreground">
              Bonus: +{50 * Math.min(profile.streak, 30)} XP
            </p>
          </div>
          <div className="bg-card p-4 rounded">
            <h4 className="text-lg mb-2">🎖️ Badges</h4>
            <ul className="text-sm list-disc pl-4" data-testid="list-badges">
              {profile.badges.length ? (
                profile.badges.map((b, i) => <li key={i}>{b}</li>)
              ) : (
                <li>No badges yet</li>
              )}
            </ul>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-card p-6 rounded">
          <h4 className="text-lg mb-3">Leaderboard</h4>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leaderboard data yet</p>
          ) : (
            <ul data-testid="list-leaderboard">
              {leaderboard.map((entry, i) => (
                <li
                  key={entry.userId}
                  className={`flex justify-between ${
                    entry.userId === profile.id ? "bg-primary/20 font-bold" : ""
                  } p-2 rounded`}
                  data-testid={`item-leaderboard-${entry.userId}`}
                >
                  <span>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`} {entry.username}
                  </span>
                  <span>Lv {entry.level} ({entry.score} pts)</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notifications */}
        <div className="mt-6">
          <h4 className="text-lg mb-2">Notifications</h4>
          <ul className="text-sm text-muted-foreground" data-testid="list-notifications">
            {notifications.length ? (
              notifications.map((n, i) => <li key={i}>• {n}</li>)
            ) : (
              <li>No recent activity</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Gamification;