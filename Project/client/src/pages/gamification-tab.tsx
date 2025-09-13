import React, { useEffect, useState } from "react";
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

function xpNeededForLevel(level: number) {
  return Math.floor(500 * Math.pow(1.25, level - 1));
}

function applyDailyBonus(user: UserProfile): UserProfile {
  const bonus = 50 * Math.min(user.streak, 30); // cap streak bonus
  return {
    ...user,
    xp: user.xp + bonus,
    streak: user.streak + 1,
  };
}

export default function GamificationTab({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("gamify-profile");
    return saved
      ? JSON.parse(saved)
      : {
          id: userId,
          username: "DemoUser",
          level: 1,
          xp: 0,
          streak: 1,
          badges: [],
          skills: ["Math", "Science"],
        };
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [cooldown, setCooldown] = useState(false);

  useEffect(() => {
    updateLeaderboard(profile);
  }, []);

  useEffect(() => {
    localStorage.setItem("gamify-profile", JSON.stringify(profile));
  }, [profile]);

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
    if (cooldown) {
      pushNotif("⏳ Please wait before earning again!");
      return;
    }
    setCooldown(true);
    setTimeout(() => setCooldown(false), 3000);

    let updated = { ...profile, xp: profile.xp + amount };
    let leveledUp = false;

    while (updated.xp >= xpNeededForLevel(updated.level)) {
      updated.xp -= xpNeededForLevel(updated.level);
      updated.level++;
      leveledUp = true;
      const badge = `Level ${updated.level} Unlocked`;
      if (!updated.badges.includes(badge)) updated.badges.push(badge);
    }

    if (leveledUp) pushNotif(`🎉 You leveled up to ${updated.level}!`);
    setProfile(updated);
    updateLeaderboard(updated);
  }

  function claimDailyBonus() {
    const updated = applyDailyBonus(profile);
    pushNotif(`🔥 Daily streak bonus applied! (+${50 * Math.min(profile.streak, 30)} XP)`);
    setProfile(updated);
    updateLeaderboard(updated);
  }

  const xpNeeded = xpNeededForLevel(profile.level);
  const progress = Math.min((profile.xp / xpNeeded) * 100, 100);

  return (
    <section id="gamify" className="py-20 bg-background font-arcade">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl text-primary text-center mb-6">🏆 Gamification</h2>

        {/* XP + LEVEL */}
        <div className="bg-card p-6 rounded-lg shadow-md mb-6 text-center">
          <h3 className="text-xl mb-2">Level {profile.level}</h3>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
            className="h-4 bg-primary rounded-full"
            title={`${profile.xp} / ${xpNeeded} XP`}
          />
          <p className="text-sm mt-2 animate-pulse">
            {profile.xp} / {xpNeeded} XP ({progress.toFixed(1)}%)
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center mb-6">
          <Button
            onClick={() => earnPoints(120)}
            className="bg-primary px-6"
            disabled={cooldown}
          >
            {cooldown ? "Cooldown..." : "Earn Points"}
          </Button>
          <Button onClick={claimDailyBonus} className="bg-accent px-6">
            Claim Daily Bonus
          </Button>
        </div>

        {/* Streaks & Badges */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card p-4 rounded">
            <h4 className="text-lg mb-2">🔥 Streak</h4>
            <p>{profile.streak} days</p>
            <p className="text-xs text-muted-foreground">
              Bonus: +{50 * Math.min(profile.streak, 30)} XP
            </p>
          </div>
          <div className="bg-card p-4 rounded">
            <h4 className="text-lg mb-2">🎖️ Badges</h4>
            {profile.badges.length ? (
              <ul className="text-sm list-disc pl-4">
                {profile.badges.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No badges yet</p>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-card p-6 rounded">
          <h4 className="text-lg mb-3">Leaderboard</h4>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leaderboard data yet</p>
          ) : (
            <ul>
              {leaderboard.map((entry, i) => (
                <li
                  key={entry.userId}
                  className={`flex justify-between ${
                    entry.userId === profile.id ? "bg-primary/20 font-bold" : ""
                  } p-2 rounded`}
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
          <ul className="text-sm text-muted-foreground">
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
