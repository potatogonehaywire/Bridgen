import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMatchMe, UserProfile } from "../hooks/useMatchMe";

interface MatchMeSectionProps {
  currentUser: UserProfile;
}

export default function MatchMeSection({ currentUser }: MatchMeSectionProps) {
  const {
    matches,
    topMatch,
    isQueued,
    isAutoMatch,
    notifications,
    startAutoMatch,
    stopAutoMatch,
    manualRequestMatch,
    acceptTopMatch,
    updateProfile,
  } = useMatchMe(currentUser);

  const [localProfile, setLocalProfile] = useState<UserProfile | null>(currentUser ?? null);

  useEffect(() => {
    setLocalProfile(currentUser);
  }, [currentUser]);

  return (
    <section id="match-me" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="font-arcade text-primary text-2xl md:text-4xl mb-2">FIND YOUR MATCH</h2>
          <p className="text-sm text-muted-foreground">Real-time auto-sync matchmaking</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-card rounded-lg p-6">
            <h3 className="font-medium mb-2">Your Profile</h3>
            {localProfile ? (
              <>
                <div className="text-sm mb-2">ID: {localProfile.id}</div>
                <div className="text-sm mb-2">
                  Skills: {localProfile.skills?.length ? localProfile.skills.join(", ") : "None listed"}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Loading profile...</div>
            )}

            <div className="flex gap-2 mt-4">
              <Button onClick={isAutoMatch ? stopAutoMatch : startAutoMatch} className="w-full">
                {isAutoMatch ? "Stop Auto-Match" : "Start Auto-Match"}
              </Button>
              <Button onClick={manualRequestMatch} variant="outline" className="w-full">
                Find Now
              </Button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              {isQueued ? "⏳ Searching for matches..." : "❌ Not searching"}
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium">Notifications</h4>
              <ul className="text-xs text-muted-foreground list-disc pl-4">
                {notifications?.length ? (
                  notifications.map((n, i) => <li key={i}>{n}</li>)
                ) : (
                  <li>No notifications</li>
                )}
              </ul>
            </div>
          </div>

          {/* Top match */}
          <div className="bg-card rounded-lg p-6">
            <h3 className="font-medium mb-3">Top Match</h3>
            {topMatch ? (
              <>
                <div className="mb-3">
                  <div className="text-lg font-bold">{topMatch.username ?? topMatch.userId}</div>
                  <div className="text-sm text-muted-foreground">
                    Skills: {topMatch.sharedSkills?.join(", ") || "No shared skills"}
                  </div>
                  {topMatch.sharedAvailability?.length && topMatch.sharedAvailability.length > 0 && (
                    <div className="text-xs">
                      Availability overlap: {topMatch.sharedAvailability?.join(", ")}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  Compatibility: <strong>{topMatch.score ?? "N/A"}</strong>
                </div>
                <Button onClick={acceptTopMatch} className="w-full bg-accent">
                  Auto-Sync Session
                </Button>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No matches yet</div>
            )}
          </div>

          {/* Match list */}
          <div className="bg-card rounded-lg p-6">
            <h3 className="font-medium mb-3">Other Matches</h3>
            {matches?.length === 0 ? (
              <div className="text-sm text-muted-foreground">No matches yet</div>
            ) : (
              matches.map((m) => (
                <div key={m.userId} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{m.username ?? m.userId}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.sharedSkills?.join(", ") || "No shared skills"}
                    </div>
                  </div>
                  <div className="text-sm font-bold">{m.score ?? "N/A"}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
